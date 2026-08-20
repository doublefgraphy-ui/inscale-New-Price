(() => {
  "use strict";

  const CSV_URL = "sale.csv";
  const floorOrder = ["4F", "2F", "B1"];

  const productList = document.getElementById("productList");
  const searchInput = document.getElementById("searchInput");
  const countText = document.getElementById("countText");
  const emptyState = document.getElementById("emptyState");
  const resetBtn = document.getElementById("resetBtn");
  const homeBtn = document.getElementById("homeBtn");
  const floorTabs = document.getElementById("floorTabs");

  let products = [];
  let activeFloor = "ALL";

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"' && inQuotes && next === '"') {
        field += '"';
        i++;
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
        if (ch === "\r" && next === "\n") i++;
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

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function money(value) {
    const n = Number(String(value || "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? `₩${n.toLocaleString("ko-KR")}` : "-";
  }

  function searchText(item) {
    return [
      item.floor, item.brand, item.name, item.category, item.designer,
      item.size, item.material, item.color, item.origin, item.note
    ].join(" ").toLowerCase();
  }

  function specRow(label, value) {
    if (!String(value || "").trim()) return "";
    return `
      <div class="spec-row">
        <span>${label}</span>
        <strong>${escapeHTML(value)}</strong>
      </div>
    `;
  }

  function card(item) {
    const note = item.note
      ? `<div class="note">${escapeHTML(item.note)}</div>`
      : "";

    return `
      <article class="card">
        <div class="thumb">
          <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy">
        </div>

        <div class="card-body">
          <div class="meta">
            <span class="badge dark">${escapeHTML(item.floor)}</span>
            <span class="badge">${escapeHTML(item.category)}</span>
            <span class="badge sale">DISPLAY SALE</span>
          </div>

          <h2 class="name">${escapeHTML(item.name)}</h2>
          <p class="brand">${escapeHTML(item.brand)}</p>

          <div class="retail-block">
            <div class="retail-label">RETAIL PRICE</div>
            <div class="retail-price">${money(item.retail_price)}</div>
          </div>

          <div class="sale-box">
            <div class="sale-head">
              <span class="sale-label">SALE PRICE</span>
              <span class="discount-rate">${escapeHTML(item.discount_rate)}% OFF</span>
            </div>
            <div class="sale-price">${money(item.sale_price)}</div>
            ${note}
          </div>

          <div class="spec">
            ${specRow("Designer", item.designer)}
            ${specRow("Size", item.size)}
            ${specRow("Material", item.material)}
            ${specRow("Color", item.color)}
            ${specRow("Origin", item.origin)}
          </div>
        </div>
      </article>
    `;
  }

  function buildFloorTabs() {
    const found = [...new Set(products.map(p => p.floor).filter(Boolean))];
    found.sort((a, b) => {
      const ai = floorOrder.indexOf(a);
      const bi = floorOrder.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    const floors = ["ALL", ...found];
    floorTabs.innerHTML = floors.map(f => `
      <button class="floor-btn ${f === activeFloor ? "is-active" : ""}"
        type="button" data-floor="${escapeHTML(f)}">
        ${f}
      </button>
    `).join("");

    floorTabs.querySelectorAll(".floor-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeFloor = btn.dataset.floor;
        buildFloorTabs();
        render();
      });
    });
  }

  function render() {
    const q = searchInput.value.trim().toLowerCase();

    const filtered = products.filter(item => {
      const floorOk = activeFloor === "ALL" || item.floor === activeFloor;
      const searchOk = !q || searchText(item).includes(q);
      return floorOk && searchOk;
    });

    productList.innerHTML = filtered.map(card).join("");
    countText.textContent = `${filtered.length.toLocaleString("ko-KR")} PRODUCTS`;
    emptyState.hidden = filtered.length > 0;
  }

  async function load() {
    try {
      const res = await fetch(`${CSV_URL}?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`CSV load failed: ${res.status}`);
      const text = await res.text();
      products = parseCSV(text);
      buildFloorTabs();
      render();
    } catch (err) {
      console.error(err);
      countText.textContent = "데이터를 불러오지 못했습니다.";
      emptyState.hidden = false;
      emptyState.textContent = "sale.csv 파일 위치를 확인해 주세요.";
    }
  }

  searchInput.addEventListener("input", render);

  resetBtn.addEventListener("click", () => {
    activeFloor = "ALL";
    searchInput.value = "";
    buildFloorTabs();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  homeBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  load();
})();
