INSCALE SHOWROOM PRICE — NEW UI
2026-09-28

구성 파일
- index.html
- style.css
- script.js
- price.csv (중복 통합 371개 제품)

업데이트 방법
1. GitHub 저장소 doublefgraphy-ui/inscale-price 에서 위 4개 파일을 교체합니다.
2. 기존 cassina-stock.csv / vitra-stock.csv / artek-stock.csv 등은 삭제하지 않아도 됩니다.
3. GitHub Pages 캐시 때문에 반영까지 잠시 걸릴 수 있습니다.

주요 변경
- Euro Ceramic 참고 기반의 카탈로그형 UI
- 층별 탭: ALL / B1 / 1F / 2F / 3F / 4F / DP SALE
- 브랜드별 자동 그룹핑 및 제품 수 표시
- PC 4열 / 태블릿 3열 / 모바일 1열 반응형
- 이미지 중심 제품 카드
- 클릭 시 상세 팝업: Designer / Size / Material / Color / Origin / Category
- MORE IMAGE / INFO LINK 지원
- 기존 price.csv 데이터 구조 사용

주의
- 현재 중복 통합 데이터는 같은 브랜드+상품명이 여러 사양인 경우 한 행에 병합되어 있습니다.
- 원본 CSV에 DP SALE 가격이 없으므로 DP SALE 표시 데이터는 별도 입력 시 자동 노출됩니다.
