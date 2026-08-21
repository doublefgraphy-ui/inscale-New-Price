(() => {
  "use strict";

  const SALE_CSV_URL = "sale.csv";
  const SAARINEN_CSV_URL = "saarinen.csv";
  const floorOrder = ["4F", "2F", "B1"];
  const groupOrder = ["OVAL TABLE", "ROUND HIGH", "ROUND SIDE Ø410", "ROUND SIDE Ø510"];

  const productList = document.getElementById("productList");
  const saarinenList = document.getElementById("saarinenList");
  const searchInput = document.getElementById("searchInput");
  const countText = document.getElementById("countText");
  const hintText = document.getElementById("hintText");
  const emptyState = document.getElementById("emptyState");
  const resetBtn = document.getElementById("resetBtn");
  const homeBtn = document.getElementById("homeBtn");
  const floorTabs = document.getElementById("floorTabs");
  const saarinenTabs = document.getElementById("saarinenTabs");
  const modeButtons = Array.from(document.querySelectorAll(".mode-btn"));

  let products = [];
  let saarinen = [];
  let activeMode = "sale";
  let activeFloor = "ALL";
  let activeSaarinenGroup = "ALL";

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"' && inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        row.push(field);
        field = "";
      } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
        if (field !== "" || row.length) {
          row.push(field);
          rows.push(row);
        }
        row = [];
        field = "";
        if (ch === "\r" && next === "\n") i += 1;
      } else {
        field += ch;
      }
    }

    if (field !== "" || row.length) {
      row.push(field);
      rows.push(row);
    }

    if (!rows.length) return [];

    const headers = rows.shift().map(h => h.trim().replace(/^\uFEFF/, ""));
    return rows
      .filter(r => r.some(c => String(c || "").trim() !== ""))
      .map(r => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = (r[i] || "").trim());
        return obj;
      });
  }

  function esc(v) {
    return String(v || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function num(v) {
    const n = Number(String(v || "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function money(v) {
    const n = num(v);
    return n ? `₩${n.toLocaleString("ko-KR")}` : "-";
  }

  function saleSearchText(i) {
    return [
      i.floor, i.brand, i.name, i.category, i.designer,
      i.size, i.material, i.color, i.origin, i.note
    ].join(" ").toLowerCase();
  }

  function saarinenSearchText(i) {
    return [
      "knoll", "saarinen", i.group, i.series, i.code, i.size,
      i.stock_qty, i.unit_price, i.finishing, i.incoming, i.pi_code
    ].join(" ").toLowerCase();
  }

  function specRow(label, value) {
    if (!String(value || "").trim()) return "";
    return `<div class="spec-row"><span>${label}</span><strong>${esc(value)}</strong></div>`;
  }

  function saleCard(i) {
    const note = i.note ? `<div class="note">${esc(i.note)}</div>` : "";
    return `<article class="card">
      <div class="thumb"><img src="${esc(i.image)}" alt="${esc(i.name)}" loading="lazy"></div>
      <div class="card-body">
        <div class="meta">
          <span class="badge dark">${esc(i.floor)}</span>
          <span class="badge">${esc(i.category)}</span>
          <span class="badge sale">DISPLAY SALE</span>
        </div>
        <h2 class="name">${esc(i.name)}</h2>
        <p class="brand">${esc(i.brand)}</p>
        <div class="retail-block">
          <div class="retail-label">RETAIL PRICE</div>
          <div class="retail-price">${money(i.retail_price)}</div>
        </div>
        <div class="sale-box">
          <div class="sale-head">
            <span class="sale-label">SALE PRICE</span>
            <span class="discount-rate">${esc(i.discount_rate)}% OFF</span>
          </div>
          <div class="sale-price">${money(i.sale_price)}</div>
          ${note}
        </div>
        <div class="spec">
          ${specRow("Designer", i.designer)}
          ${specRow("Size", i.size)}
          ${specRow("Material", i.material)}
          ${specRow("Color", i.color)}
          ${specRow("Origin", i.origin)}
        </div>
      </div>
    </article>`;
  }

  function stockQtyHTML(item) {
    const q = num(item.stock_qty);
    if (q > 0) {
      return `<span class="stock-pill available">재고 ${q}</span>`;
    }
    return `<span class="stock-pill zero">재고 0</span>`;
  }

  function inboundQty(item) {
    const matches = String(item.incoming || "").match(/×\s*(\d+)/g) || [];
    return matches.reduce((sum, token) => sum + Number(token.replace(/[^0-9]/g, "")), 0);
  }

  function saarinenRow(item) {
    const incoming = item.incoming
      ? `${esc(item.incoming)}${item.pi_code ? `<span class="pi-code">PI ${esc(item.pi_code)}</span>` : ""}`
      : `<span style="color:#aaa;font-weight:600">-</span>`;

    return `<div class="saarinen-row">
      <div class="stock-code">
        <span class="stock-label">MODEL CODE</span>
        ${esc(item.code)}
      </div>
      <div class="stock-size">
        <span class="stock-label">SIZE</span>
        ${esc(item.size)}
      </div>
      <div class="stock-finish">
        <span class="stock-label">FINISHING</span>
        ${esc(item.finishing)}
      </div>
      <div class="stock-price">
        <span class="stock-label">UNIT PRICE</span>
        ${money(item.unit_price)}
      </div>
      <div class="stock-status">
        <span class="stock-label">STOCK</span>
        ${stockQtyHTML(item)}
      </div>
      <div class="stock-incoming">
        <span class="stock-label">입항예정</span>
        ${incoming}
      </div>
    </div>`;
  }

  function groupCard(group, items) {
    const stockTotal = items.reduce((s, i) => s + num(i.stock_qty), 0);
    const incomingTotal = items.reduce((s, i) => s + inboundQty(i), 0);
    const title = items[0]?.series || group;

    return `<article class="saarinen-card">
      <div class="saarinen-head">
        <div>
          <p class="saarinen-kicker">KNOLL · EERO SAARINEN</p>
          <h2 class="saarinen-title">${esc(title)}</h2>
        </div>
        <div class="saarinen-summary">
          <span class="summary-pill stock">현재 재고 ${stockTotal}</span>
          <span class="summary-pill inbound">입항 예정 ${incomingTotal}</span>
          <span class="summary-pill stock">${items.length} VARIANTS</span>
        </div>
      </div>
      <div class="saarinen-variants">
        ${items.map(saarinenRow).join("")}
      </div>
    </article>`;
  }

  function buildFloorTabs() {
    const found = [...new Set(products.map(p => p.floor).filter(Boolean))].sort((a, b) => {
      const ai = floorOrder.indexOf(a), bi = floorOrder.indexOf(b);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    });
    const floors = ["ALL", ...found];

    floorTabs.innerHTML = floors.map(f =>
      `<button class="floor-btn ${f === activeFloor ? "is-active" : ""}" type="button" data-floor="${esc(f)}">${f}</button>`
    ).join("");

    floorTabs.querySelectorAll(".floor-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeFloor = btn.dataset.floor;
        buildFloorTabs();
        render();
      });
    });
  }

  function buildSaarinenTabs() {
    const found = groupOrder.filter(g => saarinen.some(i => i.group === g));
    const groups = ["ALL", ...found];

    saarinenTabs.innerHTML = groups.map(g =>
      `<button class="saarinen-filter-btn ${g === activeSaarinenGroup ? "is-active" : ""}" type="button" data-group="${esc(g)}">${esc(g)}</button>`
    ).join("");

    saarinenTabs.querySelectorAll(".saarinen-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeSaarinenGroup = btn.dataset.group;
        buildSaarinenTabs();
        render();
      });
    });
  }

  function setMode(mode) {
    activeMode = mode;

    modeButtons.forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.mode === mode);
    });

    const isSale = mode === "sale";
    productList.hidden = !isSale;
    saarinenList.hidden = isSale;
    floorTabs.hidden = !isSale;
    saarinenTabs.hidden = isSale;

    if (isSale) {
      searchInput.placeholder = "상품명, 브랜드, 디자이너, 소재 검색";
      hintText.textContent = "전시 제품은 상태를 확인 후 구매해 주세요.";
    } else {
      searchInput.placeholder = "모델코드, 사이즈, 마감, PI CODE 검색";
      hintText.textContent = "PDF 기재 기준 현재 재고 및 입항 예정 수량입니다.";
    }

    render();
  }

  function renderSale() {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = products.filter(i =>
      (activeFloor === "ALL" || i.floor === activeFloor) &&
      (!q || saleSearchText(i).includes(q))
    );

    productList.innerHTML = filtered.map(saleCard).join("");
    countText.textContent = `${filtered.length.toLocaleString("ko-KR")} PRODUCTS`;
    emptyState.hidden = filtered.length > 0;
  }

  function renderSaarinen() {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = saarinen.filter(i =>
      (activeSaarinenGroup === "ALL" || i.group === activeSaarinenGroup) &&
      (!q || saarinenSearchText(i).includes(q))
    );

    const grouped = {};
    filtered.forEach(item => {
      if (!grouped[item.group]) grouped[item.group] = [];
      grouped[item.group].push(item);
    });

    saarinenList.innerHTML = groupOrder
      .filter(group => grouped[group]?.length)
      .map(group => groupCard(group, grouped[group]))
      .join("");

    const stockTotal = filtered.reduce((s, i) => s + num(i.stock_qty), 0);
    const incomingTotal = filtered.reduce((s, i) => s + inboundQty(i), 0);

    countText.textContent = `${filtered.length} VARIANTS · 현재 재고 ${stockTotal} · 입항 예정 ${incomingTotal}`;
    emptyState.hidden = filtered.length > 0;
  }

  function render() {
    if (activeMode === "sale") renderSale();
    else renderSaarinen();
  }

  async function load() {
    try {
      const [saleRes, saarinenRes] = await Promise.all([
        fetch(`${SALE_CSV_URL}?v=${Date.now()}`, { cache: "no-store" }),
        fetch(`${SAARINEN_CSV_URL}?v=${Date.now()}`, { cache: "no-store" })
      ]);

      if (!saleRes.ok) throw new Error(`sale.csv ${saleRes.status}`);
      if (!saarinenRes.ok) throw new Error(`saarinen.csv ${saarinenRes.status}`);

      products = parseCSV(await saleRes.text());
      saarinen = parseCSV(await saarinenRes.text());

      buildFloorTabs();
      buildSaarinenTabs();
      setMode("sale");
    } catch (e) {
      console.error(e);
      countText.textContent = "데이터를 불러오지 못했습니다.";
      emptyState.hidden = false;
      emptyState.textContent = "CSV 파일 위치를 확인해 주세요.";
    }
  }

  modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      searchInput.value = "";
      setMode(btn.dataset.mode);
    });
  });

  searchInput.addEventListener("input", render);

  resetBtn.addEventListener("click", () => {
    activeFloor = "ALL";
    activeSaarinenGroup = "ALL";
    searchInput.value = "";
    buildFloorTabs();
    buildSaarinenTabs();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  homeBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  load();
})();