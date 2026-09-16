# 산초 파서 비교

PDF 파서 파일럿의 실험 결과를 정적 페이지로 정리한 사이트입니다.

- ① 파서 3종 비교 (parsers.html) — pymupdf · docling · MinerU 지면 겹쳐 보기, VLM 대 PyMuPDF4LLM
- ② 청킹 (chunking.html) — 절 단위 · 고정 1000/100 · 고정 5000/250
- ③ 표 정확도 (tables.html) — 사람 전사 골드 대조
- ④ 파서 선택 (parserchoice.html) — docling 기준 + 예외 라우팅
- ⑤ 완주 실험 (e2e.html) — 논문→답변, 언어 조건 4개
- ⑥ 청킹 시각화 (chunkviz.html) — 제목 보존·표 처리·제목 삽입 효과

빌드 도구 없이 HTML 파일만으로 동작합니다. 사이트: https://oon-jung.github.io/sancho-parser-compare/
