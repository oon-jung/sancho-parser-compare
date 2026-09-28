/* 페이지의 글을 브라우저에서 직접 고치는 기능. 제목·설명·표 칸·결론까지 본문 전체가 대상이다.
   고치기를 켠 동안에만 글이 편집 가능해지고, 끄면 원래 동작으로 돌아간다.
   고친 내용은 이 브라우저에 남고 JSON으로 내려받아 실제 파일에 반영한다. */
(function(){
 const PAGE=location.pathname.split('/').pop()||'index.html';
 // 조작용 요소만 제외한다. 나머지 글은 전부 고칠 수 있다.
 // 조작용 요소만 제외한다. 나머지 글은 전부 고칠 수 있다.
 // 위쪽 메뉴의 이름과 링크 글자도 고칠 수 있게 넣는다(고치기를 켠 동안에는 눌러도 이동하지 않는다).
 const SKIP=['.ctl','.ed-bar','.ed-btn','.ed-w','button','select','input','label','#doc','#page'];
 const BLOCK='h1,h2,h3,h4,h5,p,li,td,th,dt,dd,figcaption,footer,summary,blockquote,.lede,.sub,.editnote,.ttl,.dsc,.fil';
 // 링크와 메뉴 이름은 그 자체로 고칠 수 있지만, 문단이 링크를 품었다고 해서 문단이 빠지면 안 된다.
 // 그래서 "자식이 또 대상이면 부모는 제외" 판단에는 BLOCK만 쓴다.
 // 상자·카드의 굵은 소제목과 정답 줄도 대상에 넣는다. 블록 요소가 아니므로 부모 제외 판단에는 넣지 않는다.
 const SEL=BLOCK+',nav.top a,nav.top b,.box>b,.goldline,.ansbox h5,.lab,.big,.sum,.bar>span,span.v';
 const KEY='pageedits:'+PAGE;
 const TKEY='pagetitle:'+PAGE;
 const SKEY='pagesizes:'+PAGE;
 let SIZES={}; try{SIZES=JSON.parse(localStorage.getItem(SKEY)||'{}');}catch(e){}
 const EDITS=JSON.parse(localStorage.getItem(KEY)||'{}');
 let nodes=[];
 function fp(t){return (t||'').replace(/\s+/g,' ').trim().slice(0,40);}
 function collect(){
  nodes=[...document.querySelectorAll(SEL)].filter(el=>{
   if(el.closest(SKIP.join(','))) return false;
   if(el.querySelector(BLOCK)) return false;        // 자식이 또 대상이면 부모는 제외(링크·메뉴 이름은 제외 판단에서 뺀다)
   return (el.textContent||'').trim().length>1;});
  nodes.forEach((el,i)=>{el.dataset.ed=i; if(!el.dataset.orig) el.dataset.orig=el.innerHTML;});
  return nodes.length;
 }
 // 원본 글이 바뀌어 더 이상 붙일 곳이 없는 수정은 지운다. 그대로 두면 세어지고 내려받기에도 섞인다.
 function apply(){
  const live=new Set();
  nodes.forEach((el,i)=>{const e=EDITS[i];
   if(e&&fp(e.fp)===fp(el.dataset.orig.replace(/<[^>]*>/g,''))){el.innerHTML=e.html; el.classList.add('ed-changed'); live.add(String(i));}});
  let dropped=0;
  Object.keys(EDITS).forEach(k=>{if(!live.has(k)){delete EDITS[k]; dropped++;}});
  if(dropped){try{localStorage.setItem(KEY,JSON.stringify(EDITS));}catch(e){}
   console.log(`[고치기] 원본이 바뀌어 더 이상 적용되지 않는 수정 ${dropped}건을 지웠습니다.`);}
 }
 // 고친 크기를 그대로 되살린다.
 function applySizes(){nodes.forEach((el,i)=>{const z=SIZES[i];
  if(z){if(z.w) el.style.width=z.w; if(z.h) el.style.height=z.h; el.classList.add('ed-sized');}});}
 function saveSize(el){
  const i=el.dataset.ed; if(i===undefined) return;
  const w=el.style.width, h=el.style.height;
  if(w||h){SIZES[i]={w,h}; el.classList.add('ed-sized');} else {delete SIZES[i]; el.classList.remove('ed-sized');}
  try{localStorage.setItem(SKEY,JSON.stringify(SIZES));}catch(e){}
  szn(); }
 function szn(){const n=Object.keys(SIZES).length; szreset.hidden=!n; szreset.textContent=`크기 ${n}곳 되돌리기`;}

 // ── 직접 만든 크기 손잡이 ─────────────────────────────
 let wlabel=null, wnum=null;   // 도구막대가 만들어진 뒤 채운다
 const grip=document.createElement('div'); grip.className='ed-grip'; document.body.append(grip);
 let gripTarget=null, drag=null;
 function placeGrip(el){
  gripTarget=el;
  if(!el){grip.classList.remove('on'); return;}
  const r=el.getBoundingClientRect();
  grip.style.left=(r.right+scrollX-10)+'px';
  grip.style.top=(r.bottom+scrollY-10)+'px';
  grip.classList.add('on');
  if(wnum&&!drag){wlabel.hidden=false; wnum.value=Math.round(r.width);}
 }
 document.addEventListener('pointerover',e=>{
  if(!document.body.classList.contains('ed-resize')||drag) return;
  const el=e.target.closest&&e.target.closest('[data-ed]');
  if(el&&!el.matches('td,th')&&!el.closest('nav.top')) placeGrip(el);
 });
 // 누름은 pointer·mouse 양쪽으로 받고, 이동과 놓기는 document에서 듣는다(포인터 캡처보다 안전하다).
 function startDrag(x,y){
  if(!gripTarget) return;
  const r=gripTarget.getBoundingClientRect();
  drag={el:gripTarget,x,y,w:r.width,h:r.height};
  gripTarget.style.maxWidth='none';          // 여기서 최대 너비 제한을 푼다
  document.body.classList.add('ed-grabbing');
  document.addEventListener('pointermove',moveDrag,true);
  document.addEventListener('mousemove',moveDrag,true);
  document.addEventListener('pointerup',endDrag,true);
  document.addEventListener('mouseup',endDrag,true);
 }
 function moveDrag(e){
  if(!drag) return;
  e.preventDefault();
  drag.el.style.width=Math.max(90,Math.round(drag.w+e.clientX-drag.x))+'px';
  drag.el.style.height=Math.max(24,Math.round(drag.h+e.clientY-drag.y))+'px';
  placeGrip(drag.el);
 }
 function endDrag(){
  if(!drag) return;
  const el=drag.el; drag=null;
  document.body.classList.remove('ed-grabbing');
  document.removeEventListener('pointermove',moveDrag,true);
  document.removeEventListener('mousemove',moveDrag,true);
  document.removeEventListener('pointerup',endDrag,true);
  document.removeEventListener('mouseup',endDrag,true);
  saveSize(el); placeGrip(el);
 }
 ['pointerdown','mousedown'].forEach(t=>grip.addEventListener(t,e=>{
  if(drag) return; e.preventDefault(); e.stopPropagation(); startDrag(e.clientX,e.clientY);}));
 window.addEventListener('scroll',()=>{if(gripTarget&&!drag) placeGrip(gripTarget);},true);
 window.addEventListener('resize',()=>{if(gripTarget&&!drag) placeGrip(gripTarget);});
 // 끌어서 크기를 바꾼 것을 알아채 저장한다.
 let RO=null;
 function watchSizes(){
  if(!('ResizeObserver' in window)) return;
  if(RO) RO.disconnect();
  let t=null;
  RO=new ResizeObserver(es=>{clearTimeout(t); t=setTimeout(()=>es.forEach(e=>saveSize(e.target)),250);});
  nodes.forEach(el=>{if(!el.matches('td,th')) RO.observe(el);});
 }
 function setMode(on){
  if(on){document.querySelectorAll('[data-ed]').forEach(el=>el.removeAttribute('data-ed')); collect(); apply(); applySizes();}
  document.body.classList.toggle('ed-on',on);
  nodes.forEach(el=>{if(on) el.setAttribute('contenteditable','true'); else el.removeAttribute('contenteditable');});
  document.body.classList.toggle('ed-resize',on&&szbtn.getAttribute('aria-pressed')==='true');
  if(!on){grip.classList.remove('on'); gripTarget=null; if(wlabel) wlabel.hidden=true;}
  if(on) watchSizes(); else if(RO) RO.disconnect();
  btn.setAttribute('aria-pressed',on); bar.hidden=!on; count();
 }
 function count(){let t=null; try{t=localStorage.getItem(TKEY);}catch(e){}
  const n=Object.keys(EDITS).length+(t?1:0);
  dl.hidden=!n; dl.textContent=`고친 글 ${n}곳 내려받기`; cp.hidden=!n; reset.hidden=!n;}
 // 도구막대
 const bar=document.createElement('div'); bar.className='ed-bar'; bar.hidden=true;
 bar.innerHTML='<span><b>이 브라우저에만 저장됩니다.</b> 원본 파일과 공개 사이트는 그대로입니다. 반영하려면 아래에서 내려받거나 복사해 전달하세요.</span>'
  +'<label class="ed-tl">탭 제목 <input type="text" class="ed-title"></label>'
  +'<label class="ed-tl ed-wl" hidden>고른 박스 너비 <input type="number" class="ed-wnum" min="90" step="20"> px</label>';
 const dl=document.createElement('button'); dl.className='ed-dl'; dl.hidden=true;
 const szbtn=document.createElement('button'); szbtn.className='ed-sz'; szbtn.type='button'; szbtn.textContent='박스 크기 조절'; szbtn.setAttribute('aria-pressed','false');
 const szreset=document.createElement('button'); szreset.className='ed-szreset'; szreset.hidden=true;
 const cp=document.createElement('button'); cp.className='ed-cp'; cp.textContent='고친 글 복사'; cp.hidden=true;
 const reset=document.createElement('button'); reset.className='ed-reset'; reset.textContent='모두 되돌리기'; reset.hidden=true;
 bar.append(szbtn,szreset,dl,cp,reset);
 // 본문 너비 조절. 글줄이 너무 짧거나 길면 읽기 불편하므로 사용자가 고른다.
 const WKEY='pagewidth';
 const WIDTHS=[['좁게','780px','68ch'],['보통','1160px','86ch'],['넓게','1440px','110ch'],['가득','100%','none']];
 function setWidth(i){
  const [,w,l]=WIDTHS[i]||WIDTHS[1];
  document.documentElement.style.setProperty('--page-w',w);
  document.documentElement.style.setProperty('--lede-w',l);
  try{localStorage.setItem(WKEY,i);}catch(e){}
  wbar.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',j===i?'true':'false'));
 }
 const wbar=document.createElement('div'); wbar.className='ed-w';
 wbar.innerHTML='<span>본문 너비</span>'+WIDTHS.map(([n])=>`<button type="button">${n}</button>`).join('');
 wbar.querySelectorAll('button').forEach((b,i)=>b.addEventListener('click',()=>setWidth(i)));
 const wstyle=document.createElement('style');
 wstyle.textContent=`body main{max-width:var(--page-w,1160px)!important}
body.ed-resize main{max-width:none!important;padding-right:40px}
 body p.lede,body .lede{max-width:var(--lede-w,86ch)!important}
 .ed-w{position:fixed;right:16px;bottom:58px;z-index:50;display:flex;gap:3px;align-items:center;background:#fff;border:1px solid var(--rule,#d5d9e2);border-radius:999px;padding:4px 10px 4px 12px;box-shadow:0 2px 8px rgba(0,0,0,.14);font:12px "IBM Plex Sans KR",sans-serif;color:#737c8c}
 .ed-w span{margin-right:4px}
 .ed-w button{font:12px inherit;border:0;background:none;color:#4a5160;padding:2px 7px;border-radius:999px;cursor:pointer}
 .ed-w button[aria-pressed="true"]{background:#16181d;color:#fff;font-weight:600}
 body.ed-on .ed-w{bottom:96px}
 @media(max-width:700px){.ed-w{left:16px;right:16px;bottom:58px;justify-content:center}}`;
 document.head.append(wstyle); document.body.append(wbar);
 { let i=1; try{const v=localStorage.getItem(WKEY); if(v!==null) i=+v;}catch(e){} setWidth(i); }

 // 탭에 뜨는 제목도 따로 고칠 수 있게 한다.
 function applyTitle(){try{const v=localStorage.getItem(TKEY); if(v) document.title=v;}catch(e){}}
 applyTitle();

 wlabel=bar.querySelector('.ed-wl'); wnum=bar.querySelector('.ed-wnum');
 if(wnum) wnum.addEventListener('input',()=>{
  if(!gripTarget) return;
  const v=Math.max(90,parseInt(wnum.value||'0',10));
  if(!v) return;
  gripTarget.style.maxWidth='none'; gripTarget.style.width=v+'px';
  saveSize(gripTarget);
  const r=gripTarget.getBoundingClientRect();
  grip.style.left=(r.right+scrollX-10)+'px'; grip.style.top=(r.bottom+scrollY-10)+'px';});
 const btn=document.createElement('button'); btn.className='ed-btn'; btn.type='button'; btn.textContent='본문 고치기'; btn.setAttribute('aria-pressed','false');
 const style=document.createElement('style');
 style.textContent=`.ed-btn{position:fixed;right:16px;bottom:16px;z-index:50;font:600 13px "IBM Plex Sans KR",sans-serif;padding:9px 16px;border-radius:999px;border:1px solid var(--rule,#d5d9e2);background:#fff;color:#4a5160;box-shadow:0 2px 8px rgba(0,0,0,.14);cursor:pointer}
 .ed-btn[aria-pressed="true"]{background:#16181d;color:#fff;border-color:#16181d}
 .ed-bar{position:fixed;left:0;right:0;bottom:0;z-index:49;background:#fffdf5;border-top:1px solid #eb6834;padding:9px 90px 9px 18px;font:13px "IBM Plex Sans KR",sans-serif;color:#4a5160;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
 .ed-bar button{font:600 12px inherit;padding:4px 12px;border-radius:999px;border:1px solid #1f6f5c;color:#1f6f5c;background:#fff;cursor:pointer}
 .ed-bar .ed-reset{border-color:#a3232b;color:#a3232b}
 .ed-bar .ed-cp{border-color:#2a78d6;color:#2a78d6}
 .ed-bar .ed-sz{border-color:#7a4fb5;color:#7a4fb5}
 .ed-bar .ed-sz[aria-pressed="true"]{background:#7a4fb5;color:#fff}
 .ed-bar .ed-szreset{border-color:#7a4fb5;color:#7a4fb5}
 /* 끌어서 크기 바꾸기: 오른쪽 아래 모서리를 잡아당긴다. 표 칸은 브라우저가 지원하지 않아 제외한다. */
 /* 최대 너비 제한이 걸려 있으면 끌어도 가로로 커지지 않는다. 조절 중에는 제한을 푼다. */
 body.ed-resize [data-ed]:not(td):not(th):not(nav.top *){outline-color:rgba(122,79,181,.55)}
 /* 직접 만든 손잡이. 브라우저 기본 resize는 모서리에서 이벤트를 삼켜 최대 너비 제한을 풀 수 없다. */
 .ed-grip{position:absolute;width:20px;height:20px;z-index:48;background:#7a4fb5;border:2px solid #fff;border-radius:4px;
  box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:nwse-resize;display:none;touch-action:none}
 body.ed-resize .ed-grip.on{display:block}
 body.ed-grabbing{cursor:nwse-resize!important;user-select:none!important}
 body [data-ed].ed-sized{box-shadow:inset 0 0 0 1px rgba(122,79,181,.35);max-width:none!important}
 /* 손잡이를 쉽게 잡도록 모서리를 키운다 */
 .ed-bar .ed-tl{display:flex;gap:6px;align-items:center;font:12px inherit;color:#737c8c}
 .ed-bar .ed-title{font:13px "IBM Plex Sans KR",sans-serif;padding:4px 9px;border:1px solid #d5d9e2;border-radius:6px;min-width:260px;background:#fff;color:#16181d}
 .ed-bar .ed-wnum{font:13px "IBM Plex Sans KR",sans-serif;padding:4px 7px;border:1px solid #7a4fb5;border-radius:6px;width:96px;background:#fff;color:#16181d}
 body.ed-on nav.top [data-ed]{outline:1px dashed rgba(255,255,255,.55);outline-offset:2px;cursor:text}
 body.ed-on nav.top [data-ed]:focus{outline:2px solid #eb6834;background:rgba(255,255,255,.18);color:#fff}
 body.ed-on nav.top [data-ed]{opacity:1}
 body.ed-on nav.top a[data-ed]{cursor:text}
 body.ed-on [data-ed]{outline:1px dashed rgba(235,104,52,.5);outline-offset:2px;cursor:text}
 body.ed-on [data-ed]:focus{outline:2px solid #eb6834;background:#fffdf5}
 .ed-changed{background:#fff9e6;box-shadow:inset 0 -2px 0 rgba(235,104,52,.45)}
 /* 어두운 메뉴 막대에서는 흰 글씨가 옅은 배경에 묻히므로 밑줄만 쓴다. */
 nav.top .ed-changed{background:none;box-shadow:inset 0 -2px 0 #eb6834;border-radius:0}`;
 document.head.append(style); document.body.append(btn,bar);
 btn.addEventListener('click',()=>setMode(btn.getAttribute('aria-pressed')!=='true'));
 const tinput=bar.querySelector('.ed-title');
 tinput.value=document.title;
 tinput.addEventListener('input',()=>{
  const v=tinput.value.trim();
  document.title=v||PAGE;
  try{ if(v) localStorage.setItem(TKEY,v); else localStorage.removeItem(TKEY); }catch(e){}});
 function save(el){
  if(!el||el.dataset.ed===undefined) return;
  const i=el.dataset.ed;
  if(el.innerHTML!==el.dataset.orig){EDITS[i]={html:el.innerHTML,fp:el.dataset.orig.replace(/<[^>]*>/g,''),text:el.textContent};
   el.classList.add('ed-changed');} else {delete EDITS[i]; el.classList.remove('ed-changed');}
  localStorage.setItem(KEY,JSON.stringify(EDITS)); count();}
 // 요소마다 따로 타이머를 둔다. 하나를 고치다 다른 곳으로 옮겨도 앞의 저장이 취소되지 않는다.
 const timers=new Map();
 document.addEventListener('input',e=>{
  const el=e.target.closest&&e.target.closest('[data-ed]'); if(!el) return;
  const k=el.dataset.ed; clearTimeout(timers.get(k));
  timers.set(k,setTimeout(()=>{timers.delete(k); save(el);},400));});
 document.addEventListener('focusout',e=>{const el=e.target.closest&&e.target.closest('[data-ed]'); if(el) save(el);});
 // 고치기를 켠 동안 링크를 누르면 이동하지 않고 글자에 커서가 놓인다.
 document.addEventListener('click',e=>{
  if(!document.body.classList.contains('ed-on')) return;
  const a=e.target.closest&&e.target.closest('nav.top a[data-ed]'); if(a){e.preventDefault();}},true);
 window.__edSave=save;
 dl.addEventListener('click',()=>{
  const rows=Object.entries(EDITS).map(([i,e])=>({page:PAGE,index:+i,원본:e.fp,고친글:e.text,고친HTML:e.html}));
  let tt=null; try{tt=localStorage.getItem(TKEY);}catch(e){}
  if(tt) rows.unshift({page:PAGE,index:'탭 제목',원본:'',고친글:tt,고친HTML:tt});
  const b=new Blob([JSON.stringify(rows,null,1)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=PAGE.replace('.html','')+'_글수정.json'; a.click();});
 szbtn.addEventListener('click',()=>{
  const on=szbtn.getAttribute('aria-pressed')!=='true';
  szbtn.setAttribute('aria-pressed',on);
  document.body.classList.toggle('ed-resize',on&&document.body.classList.contains('ed-on'));
  if(!on){grip.classList.remove('on'); gripTarget=null; if(wlabel) wlabel.hidden=true;}});
 szreset.addEventListener('click',()=>{
  nodes.forEach(el=>{el.style.width='';el.style.height='';el.style.maxWidth='';el.classList.remove('ed-sized');});
  SIZES={}; try{localStorage.setItem(SKEY,'{}');}catch(e){} szn();});
 cp.addEventListener('click',async()=>{
  const lines=[`[${PAGE}] 고친 글`];
  let t=null; try{t=localStorage.getItem(TKEY);}catch(e){}
  if(t) lines.push(`- 탭 제목: "${t}"`);
  Object.values(EDITS).forEach(e=>lines.push(`- "${e.fp.trim()}" → "${e.text.trim()}"`));
  const txt=lines.join('\n');
  try{await navigator.clipboard.writeText(txt); cp.textContent='복사했습니다'; setTimeout(()=>cp.textContent='고친 글 복사',1600);}
  catch(err){const ta=document.createElement('textarea'); ta.value=txt; document.body.append(ta); ta.select();
   try{document.execCommand('copy'); cp.textContent='복사했습니다'; setTimeout(()=>cp.textContent='고친 글 복사',1600);}catch(e2){alert(txt);}
   ta.remove();}});
 reset.addEventListener('click',()=>{if(!confirm('고친 글을 모두 되돌릴까요? 탭 제목도 함께 돌아갑니다.'))return;
  nodes.forEach(el=>{el.innerHTML=el.dataset.orig; el.classList.remove('ed-changed');});
  Object.keys(EDITS).forEach(k=>delete EDITS[k]); localStorage.setItem(KEY,'{}');
  try{localStorage.removeItem(TKEY); localStorage.removeItem(SKEY);}catch(e){}
  location.reload();});
 // 데이터 영역이 다시 그려져도 정적 본문은 그대로이므로 한 번만 수집
 // 고치기를 켤 때 다시 수집하므로, 데이터 영역이 나중에 그려져도 대상에 들어온다.
 function boot(){collect(); apply(); applySizes(); count(); szn();}
 window.addEventListener('load',boot);
 if(document.readyState==='complete') boot();
})();
