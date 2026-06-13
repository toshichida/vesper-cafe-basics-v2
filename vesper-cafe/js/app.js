// Vesper Cafe — モックデータ読み込み & ページ描画

const CATEGORY_LABELS = {
  coffee: "Coffee",
  tea: "Tea",
  food: "Food",
};

const BADGE_LABELS = {
  signature: "Signature",
  seasonal: "Seasonal",
};

let menuData = null;
let activeCategory = "all";

async function loadMockData() {
  const response = await fetch("data/menu-mock.json");
  if (!response.ok) {
    throw new Error(`Failed to load mock data: ${response.status}`);
  }
  return response.json();
}

function renderShopInfo(shop) {
  document.getElementById("shop-established").textContent = shop.established;
  document.getElementById("shop-name").textContent = shop.name;
  document.getElementById("shop-name-ja").textContent = shop.nameJa;
  document.getElementById("shop-tagline").textContent = shop.tagline;
  document.getElementById("shop-description").textContent = shop.description;
}

function renderLocation(location) {
  document.getElementById("location-address").textContent = location.address;
  document.getElementById("location-access").textContent = location.access;
  document.getElementById("location-hours-weekday").textContent = location.hours.weekday;
  document.getElementById("location-hours-weekend").textContent = location.hours.weekend;
  document.getElementById("location-closed").textContent = location.closed;

  const phoneEl = document.getElementById("location-phone");
  phoneEl.textContent = location.phone;
  phoneEl.href = `tel:${location.phone.replace(/-/g, "")}`;

  const { lat, lng } = location.coordinates;
  document.getElementById("location-coords").textContent =
    `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
}

function createMenuCard(item) {
  const card = document.createElement("article");
  card.className = "menu-card";
  card.dataset.category = item.category;

  if (item.badge) {
    const badge = document.createElement("span");
    badge.className = `menu-card-badge${item.badge === "seasonal" ? " seasonal" : ""}`;
    badge.textContent = BADGE_LABELS[item.badge] || item.badge;
    card.appendChild(badge);
  }

  const category = document.createElement("p");
  category.className = "menu-card-category";
  category.textContent = CATEGORY_LABELS[item.category] || item.category;
  card.appendChild(category);

  const name = document.createElement("h3");
  name.className = "menu-card-name";
  name.textContent = item.name;
  card.appendChild(name);

  if (item.nameJa) {
    const nameJa = document.createElement("p");
    nameJa.className = "menu-card-name-ja";
    nameJa.textContent = item.nameJa;
    card.appendChild(nameJa);
  }

  const desc = document.createElement("p");
  desc.className = "menu-card-desc";
  desc.textContent = item.description;
  card.appendChild(desc);

  const price = document.createElement("p");
  price.className = "menu-card-price";
  price.textContent = item.price.toLocaleString("ja-JP");
  card.appendChild(price);

  return card;
}

function renderMenu(menu) {
  const grid = document.getElementById("menu-grid");
  grid.innerHTML = "";

  const filtered =
    activeCategory === "all"
      ? menu
      : menu.filter((item) => item.category === activeCategory);

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "menu-loading";
    empty.textContent = "該当するメニューはありません。";
    grid.appendChild(empty);
    return;
  }

  filtered.forEach((item) => {
    grid.appendChild(createMenuCard(item));
  });
}

function setupFilters(menu) {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;

      buttons.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-selected", String(isActive));
      });

      renderMenu(menu);
    });
  });
}

function renderFooter() {
  document.getElementById("footer-year").textContent = new Date().getFullYear();
}

async function init() {
  const grid = document.getElementById("menu-grid");
  grid.innerHTML = '<p class="menu-loading">Loading menu…</p>';

  try {
    menuData = await loadMockData();
    renderShopInfo(menuData.shop);
    renderLocation(menuData.location);
    renderMenu(menuData.menu);
    setupFilters(menuData.menu);
    renderFooter();
  } catch (err) {
    console.error("Vesper Cafe:", err);
    grid.innerHTML =
      '<p class="menu-error">メニューの読み込みに失敗しました。ローカルサーバーで開いてください。</p>';
  }
}

document.addEventListener("DOMContentLoaded", init);
