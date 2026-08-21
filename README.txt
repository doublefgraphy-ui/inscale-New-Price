INSCALE DISPLAY SALE + SAARINEN 재고&입항

구성
- DISPLAY SALE: 기존 4F + 2F, 73개 제품
- SAARINEN 재고&입항: 34 variants
  · Saarinen Oval Table: 8
  · Saarinen Round High Table: 11
  · Saarinen Round Side Table Ø410: 7
  · Saarinen Round Side Table Ø510: 8
- Saarinen 현재재고 합계: 36
- Saarinen PDF 입항예정 수량 합계: 51

UI
- 상단 메인 카테고리:
  DISPLAY SALE | SAARINEN 재고&입항
- DISPLAY SALE 모드:
  ALL / 4F / 2F
- SAARINEN 모드:
  ALL / OVAL TABLE / ROUND HIGH / ROUND SIDE Ø410 / ROUND SIDE Ø510
- Saarinen 이미지는 사용하지 않고 모델코드, 사이즈, 마감, 가격, 현재재고, 입항예정, PI CODE 위주로 표시합니다.

중요
- 입항 예정일/수량은 제공된 PDF에 적힌 값을 그대로 반영했습니다.
- PDF에는 8/14, 8/16, 9/16, 9/26 입항예정 값이 포함되어 있습니다.

GitHub 업로드
기존 inscale-Display-Sale 저장소의 파일을 이번 ZIP 내용으로 교체하면 됩니다.
새로 추가된 saarinen.csv도 반드시 함께 업로드하세요.

필수 파일
- index.html
- style.css
- script.js
- sale.csv
- saarinen.csv
- images/


[MODE SEPARATION FIX]
- DISPLAY SALE과 SAARINEN 재고&입항 화면을 완전히 분리했습니다.
- DISPLAY SALE 모드에서는 Saarinen 재고 리스트/필터가 숨겨집니다.
- SAARINEN 모드에서는 DISPLAY SALE 제품 카드와 층 필터가 완전히 숨겨집니다.
- CSS [hidden] 충돌을 수정했고 JS에서도 이중으로 display를 제어합니다.
- 캐시 방지를 위해 style.css / script.js 버전을 v=5로 올렸습니다.
