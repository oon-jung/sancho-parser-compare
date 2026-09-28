/* 페이지의 글을 브라우저에서 직접 고치는 기능. 제목·설명·표 칸·결론까지 본문 전체가 대상이다.
   고치기를 켠 동안에만 글이 편집 가능해지고, 끄면 원래 동작으로 돌아간다.
   고친 내용은 이 브라우저에 남고 JSON으로 내려받아 실제 파일에 반영한다. */
(function(){
 const PAGE=location.pathname.split('/').pop()||'index.html';
 // 조작용 요소만 제외한다. 나머지 글은 전부 고칠 수 있다.
 const SKIP=['nav.top','.ctl','.ed-bar','.ed-btn','button','select','input','label','a','#doc','#page'];
 const SEL='h1,h2,h3,h4,h5,p,li,td,th,dt,dd,figcaption,footer,summary,blockquote,.lede,.sub,.editnote,.ttl,.dsc,.fil';
 const KEY='pageedits:'+PAGE;
 const EDITS=JSON.parse(localStorage.getItem(KEY)||'{}');
 let nodes=[];
 function fp(t){return (t||'').replace(/\s+/g,' ').trim().slice(0,40);}
 function collect(){
  nodes=[...document.querySelectorAll(SEL)].filter(el=>{
   if(el.closest(SKIP.join(','))) return false;
   if(el.querySelector(SEL)) return false;          // 자식이 또 대상이면 부모는 제외
   return (el.textContent||'').trim().length>1;});
  nodes.forEach((el,i)=>{el.dataset.ed=i; if(!el.dataset.orig) el.dataset.orig=el.innerHTML;});
  return nodes.length;
 }
 function apply(){nodes.forEach((el,i)=>{const e=EDITS[i];
  if(e&&fp(e.fp)===fp(el.dataset.orig.replace(/<[^>]*>/g,''))){el.innerHTML=e.html; el.classList.add('ed-changed');}});}
 function setMode(on){
  if(on){document.querySelectorAll('[data-ed]').forEach(el=>el.removeAttribute('data-ed')); collect(); apply();}
  document.body.classList.toggle('ed-on',on);
  nodes.forEach(el=>{if(on) el.setAttribute('contenteditable','true'); else el.removeAttribute('contenteditable');});
  btn.setAttribute('aria-pressed',on); bar.hidden=!on; count();
 }
 function count(){const n=Object.keys(EDITS).length; dl.hidden=!n; dl.textContent=`고친 글 ${n}곳 내려받기`; reset.hidden=!n;}
 // 도구막대
 const bar=document.createElement('div'); bar.className='ed-bar'; bar.hidden=true;
 bar.innerHTML='<span>제목·설명·표 칸까지 눌러서 고칠 수 있습니다. 다른 곳을 누르면 저장되고 고친 곳은 노란 배경으로 남습니다. 고치기를 끄면 원래 동작으로 돌아갑니다.</span>';
 const dl=document.createElement('button'); dl.className='ed-dl'; dl.hidden=true;
 const reset=document.createElement('button'); reset.className='ed-reset'; reset.textContent='모두 되돌리기'; reset.hidden=true;
 bar.append(dl,reset);
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
 body p.lede,body .lede{max-width:var(--lede-w,86ch)!important}
 .ed-w{position:fixed;right:16px;bottom:58px;z-index:50;display:flex;gap:3px;align-items:center;background:#fff;border:1px solid var(--rule,#d5d9e2);border-radius:999px;padding:4px 10px 4px 12px;box-shadow:0 2px 8px rgba(0,0,0,.14);font:12px "IBM Plex Sans KR",sans-serif;color:#737c8c}
 .ed-w span{margin-right:4px}
 .ed-w button{font:12px inherit;border:0;background:none;color:#4a5160;padding:2px 7px;border-radius:999px;cursor:pointer}
 .ed-w button[aria-pressed="true"]{background:#16181d;color:#fff;font-weight:600}
 body.ed-on .ed-w{bottom:96px}
 @media(max-width:700px){.ed-w{left:16px;right:16px;bottom:58px;justify-content:center}}`;
 document.head.append(wstyle); document.body.append(wbar);
 { let i=1; try{const v=localStorage.getItem(WKEY); if(v!==null) i=+v;}catch(e){} setWidth(i); }

 const btn=document.createElement('button'); btn.className='ed-btn'; btn.type='button'; btn.textContent='본문 고치기'; btn.setAttribute('aria-pressed','false');
 const style=document.createElement('style');
 style.textContent=`.ed-btn{position:fixed;right:16px;bottom:16px;z-index:50;font:600 13px "IBM Plex Sans KR",sans-serif;padding:9px 16px;border-radius:999px;border:1px solid var(--rule,#d5d9e2);background:#fff;color:#4a5160;box-shadow:0 2px 8px rgba(0,0,0,.14);cursor:pointer}
 .ed-btn[aria-pressed="true"]{background:#16181d;color:#fff;border-color:#16181d}
 .ed-bar{position:fixed;left:0;right:0;bottom:0;z-index:49;background:#fffdf5;border-top:1px solid #eb6834;padding:9px 90px 9px 18px;font:13px "IBM Plex Sans KR",sans-serif;color:#4a5160;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
 .ed-bar button{font:600 12px inherit;padding:4px 12px;border-radius:999px;border:1px solid #1f6f5c;color:#1f6f5c;background:#fff;cursor:pointer}
 .ed-bar .ed-reset{border-color:#a3232b;color:#a3232b}
 body.ed-on [data-ed]{outline:1px dashed rgba(235,104,52,.5);outline-offset:2px;cursor:text}
 body.ed-on [data-ed]:focus{outline:2px solid #eb6834;background:#fffdf5}
 .ed-changed{background:#fff9e6}`;
 document.head.append(style); document.body.append(btn,bar);
 btn.addEventListener('click',()=>setMode(btn.getAttribute('aria-pressed')!=='true'));
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
 window.__edSave=save;
 dl.addEventListener('click',()=>{
  const rows=Object.entries(EDITS).map(([i,e])=>({page:PAGE,index:+i,원본:e.fp,고친글:e.text,고친HTML:e.html}));
  const b=new Blob([JSON.stringify(rows,null,1)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=PAGE.replace('.html','')+'_글수정.json'; a.click();});
 reset.addEventListener('click',()=>{if(!confirm('고친 글을 모두 되돌릴까요?'))return;
  nodes.forEach(el=>{el.innerHTML=el.dataset.orig; el.classList.remove('ed-changed');});
  Object.keys(EDITS).forEach(k=>delete EDITS[k]); localStorage.setItem(KEY,'{}'); count();});
 // 데이터 영역이 다시 그려져도 정적 본문은 그대로이므로 한 번만 수집
 // 고치기를 켤 때 다시 수집하므로, 데이터 영역이 나중에 그려져도 대상에 들어온다.
 window.addEventListener('load',()=>{collect(); apply(); count();});
 if(document.readyState==='complete'){collect(); apply(); count();}
})();
