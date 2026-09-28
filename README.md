# 산초 파서 비교

PDF 파서 파일럿의 실험 결과를 정적 페이지로 정리한 사이트입니다.

- ① 파서 3종 비교 (parsers.html) — pymupdf · docling · MinerU 지면 겹쳐 보기, VLM 대 PyMuPDF4LLM
- ② 청킹 (chunking.html) — 절 단위 · 고정 1000/100 · 고정 5000/250
- ③ 표 정확도 (tables.html) — 사람 전사 골드 대조
- ④ 파서 선택 (parserchoice.html) — docling 기준 + 예외 라우팅
- ⑤ 완주 실험 (e2e.html) — 논문→답변, 언어 조건 4개
- ⑥ 청킹 실험 — 아래 다섯 페이지

## ⑥ 청킹 실험

논문 12편을 같은 방식으로 파싱해 두고 자르는 규칙만 바꿔 검색과 답변 정확도를 쟀습니다.

- 실험 2·3 결과 (exp23.html) — 12조건 · 57문항. 묶기와 제목 접두, 5,000자를 대신할 방법, 답변 정확도
- 실험 2·3 과정 (exp23how.html) — 파이프라인 8단계와 제목 접두가 청크 글을 바꾸는 방식
- 실험 1 요약 (exp1summary.html) — 4개 언어 논문의 청킹 결과 한 장 요약
- 파싱 (exp1.html) — docling 항목을 지면 위에 올려 보기, 그림 VLM 서술 비교
- 청킹 (exp1chunk.html) — 고정 5,000자와 절 단위를 같은 지면 위에 대응
- 그림 문항 (figq.html) — 그림에서만 답이 나오는 12문항

각 페이지 오른쪽 아래 "본문 고치기"를 누르면 글을 직접 고칠 수 있습니다. 고친 내용은 그 브라우저에만 남고 JSON으로 내려받을 수 있습니다.

빌드 도구 없이 HTML 파일만으로 동작합니다. 사이트: https://oon-jung.github.io/sancho-parser-compare/
