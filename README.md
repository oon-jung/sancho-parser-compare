# 산초 파서 비교

PDF 파서 파일럿의 실험 결과를 정적 페이지로 정리한 사이트입니다.

- ① 파서 3종 비교 (parsers.html) — pymupdf · docling · MinerU 지면 겹쳐 보기, VLM 대 PyMuPDF4LLM
- ② 청킹 (chunking.html) — 절 단위 · 고정 1000/100 · 고정 5000/250
- ③ 표 정확도 (tables.html) — 사람 전사 골드 대조
- ④ 파서 선택 (parserchoice.html) — docling 기준 + 예외 라우팅
- ⑤ 완주 실험 (e2e.html) — 논문→답변, 언어 조건 4개
- ⑥ 청킹 방식 비교 — 아래 여섯 페이지를 진행 순서대로

## ⑥ 청킹 방식 비교

논문 12편을 같은 방식으로 파싱해 두고 자르는 규칙만 바꿔 검색과 답변 정확도를 쟀습니다.

- ⑥ 결과 (exp23.html) — 절 단위 청킹과 절 이름 태그 도입 검토. 네 가지 방식을 57문항으로 비교하고, 문항마다 실제 답변을 대조할 수 있다
- ⑤ 측정 방법 (exp23how.html) — 파이프라인 8단계와 절 이름 줄이 조각의 글을 바꾸는 방식
- ③ 언어별 절 보존율 (exp1summary.html) — 한국어·영어·일본어·중국어
- ① docling 파싱 결과 (exp1.html) — 항목과 지면 대조, 그림 서술 모델 비교
- 청크 경계 보기 (exp1chunk.html) — 고정 5,000자와 절 단위가 같은 지면을 어떻게 자르는가
- ④ 그림 전용 평가 문항 (figq.html) — 12문항과 그 근거 그림


빌드 도구 없이 HTML 파일만으로 동작합니다. 사이트: https://oon-jung.github.io/sancho-parser-compare/
