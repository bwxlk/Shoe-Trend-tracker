// ---------- Base data (preloaded shoes) ----------
const baseShoes = [
  {
    id: "aj1-chicago-2015",
    name: "Air Jordan 1 Retro High OG 'Chicago'",
    brand: "Jordan",
    retailPrice: 160,
    lastPrice: 900,
    releaseDate: "2015-05-30",
    priceHistory: [
      { date: "2024-10-01", source: "StockX", price: 850 },
      { date: "2024-11-01", source: "StockX", price: 880 },
      { date: "2024-12-01", source: "GOAT", price: 900 },
    ],
  },
  {
    id: "nb-550-white-green",
    name: "New Balance 550 White Green",
    brand: "New Balance",
    retailPrice: 110,
    lastPrice: 150,
    releaseDate: "2023-03-10",
    priceHistory: [
      { date: "2024-10-01", source: "StockX", price: 140 },
      { date: "2024-11-01", source: "GOAT", price: 150 },
    ],
  },
  {
    id: "af1-triple-white",
    name: "Nike Air Force 1 '07 Triple White",
    brand: "Nike",
    retailPrice: 110,
    lastPrice: 120,
    releaseDate: "2022-01-01",
    priceHistory: [
      { date: "2024-10-01", source: "Retail", price: 110 },
      { date: "2024-12-01", source: "Retail", price: 120 },
    ],
  },
];

// ---------- State ----------
let currentView = "all"; // 'all' | 'watchlist' | 'inventory'
let watchlist = loadWatchlist();
let customShoes = loadCustomShoes(); // shoes you add via inventory

// ---------- DOM elements ----------
const shoeListEl = document.getElementById("shoeList");
const shoeDetailEl = document.getElementById("shoeDetail");
const shoeDetailContentEl = document.getElementById("shoeDetailContent");
const brandFilterEl = document.getElementById("brandFilter");
const inventorySectionEl = document.getElementById("inventorySection");
const inventoryListEl = document.getElementById("inventoryList");

const allShoesBtn = document.getElementById("allShoesBtn");
const watchlistBtn = document.getElementById("watchlistBtn");
const inventoryViewBtn = document.getElementById("inventoryViewBtn");
const backBtn = document.getElementById("backBtn");
const inventoryForm = document.getElementById("inventoryForm");

// ---------- Event listeners ----------
allShoesBtn.addEventListener("click", () => {
  currentView = "all";
  showMainView();
});

watchlistBtn.addEventListener("click", () => {
  currentView = "watchlist";
  showMainView();
});

inventoryViewBtn.addEventListener("click", () => {
  currentView = "inventory";
  showMainView();
});

backBtn.addEventListener("click", () => {
  shoeDetailEl.classList.add("hidden");
  shoeListEl.classList.remove("hidden");
});

brandFilterEl.addEventListener("change", () => {
  if (currentView === "all" || currentView === "watchlist") {
    renderShoeList();
  }
});

inventoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleAddInventoryShoe();
});

// ---------- Local storage helpers ----------
function loadWatchlist() {
  const stored = localStorage.getItem("shoeWatchlist");
  return stored ? JSON.parse(stored) : [];
}

function saveWatchlist() {
  localStorage.setItem("shoeWatchlist", JSON.stringify(watchlist));
}

function loadCustomShoes() {
  const stored = localStorage.getItem("customShoes");
  return stored ? JSON.parse(stored) : [];
}

function saveCustomShoes() {
  localStorage.setItem("customShoes", JSON.stringify(customShoes));
}

// ---------- Data helpers ----------
function isInWatchlist(shoeId) {
  return watchlist.includes(shoeId);
}

function toggleWatchlist(shoeId) {
  if (isInWatchlist(shoeId)) {
    watchlist = watchlist.filter((id) => id !== shoeId);
  } else {
    watchlist.push(shoeId);
  }
  saveWatchlist();
  renderShoeList();
}

function getAllShoes() {
  // merge base shoes + custom shoes user added
  return [...baseShoes, ...customShoes];
}

function findShoeById(shoeId) {
  return getAllShoes().find((s) => s.id === shoeId);
}

// ---------- View switching ----------
function showMainView() {
  // Reset sections
  shoeDetailEl.classList.add("hidden");
  shoeListEl.classList.add("hidden");
  inventorySectionEl.classList.add("hidden");
  document.getElementById("filters").classList.add("hidden");

  if (currentView === "inventory") {
    inventorySectionEl.classList.remove("hidden");
    renderInventoryList();
  } else {
    // all or watchlist
    document.getElementById("filters").classList.remove("hidden");
    shoeListEl.classList.remove("hidden");
    renderShoeList();
  }
}

// ---------- All shoes & watchlist rendering ----------
function renderShoeList() {
  shoeListEl.innerHTML = "";

  const brand = brandFilterEl.value;
  let data = getAllShoes();

  if (brand) {
    data = data.filter((s) => (s.brand || "").toLowerCase() === brand.toLowerCase());
  }

  if (currentView === "watchlist") {
    data = data.filter((s) => isInWatchlist(s.id));
  }

  if (data.length === 0) {
    shoeListEl.textContent = "No shoes found.";
    return;
  }

  data.forEach((shoe) => {
    const card = document.createElement("article");
    card.className = "shoe-card";

    const lastPriceText = shoe.lastPrice ? `$${shoe.lastPrice}` : "N/A";
    const retailText = shoe.retailPrice ? `$${shoe.retailPrice}` : "N/A";

    card.innerHTML = `
      <h2>${shoe.name}</h2>
      <p><strong>Brand:</strong> ${shoe.brand || "Unknown"}</p>
      <p><strong>Retail:</strong> ${retailText}</p>
      <p><strong>Last Price:</strong> ${lastPriceText}</p>
      <button class="watch-btn" data-id="${shoe.id}">
        ${isInWatchlist(shoe.id) ? "★ Watching" : "☆ Watch"}
      </button>
    `;

    // Click card (not the button) to open detail
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("watch-btn")) return;
      openShoeDetail(shoe.id);
    });

    const btn = card.querySelector(".watch-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWatchlist(shoe.id);
    });

    shoeListEl.appendChild(card);
  });
}

// ---------- Detail view ----------
function openShoeDetail(shoeId) {
  const shoe = findShoeById(shoeId);
  if (!shoe) return;

  shoeListEl.classList.add("hidden");
  shoeDetailEl.classList.remove("hidden");

  const trend = getPriceTrend(shoe.priceHistory || []);

  const lastPriceText = shoe.lastPrice ? `$${shoe.lastPrice}` : "N/A";
  const retailText = shoe.retailPrice ? `$${shoe.retailPrice}` : "N/A";

  shoeDetailContentEl.innerHTML = `
    <h2>${shoe.name}</h2>
    <p><strong>Brand:</strong> ${shoe.brand || "Unknown"}</p>
    <p><strong>Release Date:</strong> ${shoe.releaseDate || "N/A"}</p>
    <p><strong>Retail Price:</strong> ${retailText}</p>
    <p><strong>Last Price:</strong> ${lastPriceText}</p>
    <p><strong>Trend:</strong> ${trend}</p>

    <h3>Price History</h3>
    ${
      shoe.priceHistory && shoe.priceHistory.length > 0
        ? `<ul>${shoe.priceHistory
            .map(
              (p) =>
                `<li>${p.date} – $${p.price} (${p.source})</li>`
            )
            .join("")}</ul>`
        : "<p>No price history yet.</p>"
    }
  `;
}

function getPriceTrend(history) {
  if (!history || history.length < 2) return "Not enough data";

  const last = history[history.length - 1].price;
  const prev = history[history.length - 2].price;

  if (last > prev) return "📈 Up";
  if (last < prev) return "📉 Down";
  return "➡️ Flat";
}

// ---------- Inventory logic ----------
function handleAddInventoryShoe() {
  const nameInput = document.getElementById("invName");
  const brandInput = document.getElementById("invBrand");
  const sizeInput = document.getElementById("invSize");
  const priceInput = document.getElementById("invPrice");
  const statusSelect = document.getElementById("invStatus");

  const name = nameInput.value.trim();
  const brand = brandInput.value.trim();
  const size = sizeInput.value.trim();
  const priceValue = priceInput.value ? Number(priceInput.value) : null;
  const status = statusSelect.value; // 'owned' | 'target'

  if (!name || !brand) {
    alert("Name and brand are required.");
    return;
  }

  const id = `custom-${Date.now()}`;

  const newShoe = {
    id,
    name,
    brand,
    retailPrice: priceValue || null,
    lastPrice: priceValue || null,
    releaseDate: null,
    priceHistory: [],
    inventoryMeta: {
      size,
      status,
      addedAt: new Date().toISOString(),
    },
  };

  customShoes.push(newShoe);
  saveCustomShoes();

  // Clear form
  nameInput.value = "";
  brandInput.value = "";
  sizeInput.value = "";
  priceInput.value = "";
  statusSelect.value = "owned";

  renderInventoryList();
  // Also refresh main list if user switches back later
  if (currentView === "all" || currentView === "watchlist") {
    renderShoeList();
  }
}

function renderInventoryList() {
  inventoryListEl.innerHTML = "";

  if (customShoes.length === 0) {
    inventoryListEl.textContent =
      "No shoes in your inventory yet. Add something above.";
    return;
  }

  customShoes
    .slice()
    .sort((a, b) => new Date(b.inventoryMeta.addedAt) - new Date(a.inventoryMeta.addedAt))
    .forEach((shoe) => {
      const card = document.createElement("article");
      card.className = "inventory-card";

      const priceText = shoe.lastPrice ? `$${shoe.lastPrice}` : "N/A";
      const sizeText = shoe.inventoryMeta.size || "N/A";
      const statusLabel =
        shoe.inventoryMeta.status === "owned" ? "Owned" : "Want to buy";

      card.innerHTML = `
        <h3>${shoe.name}</h3>
        <p><strong>Brand:</strong> ${shoe.brand}</p>
        <p><strong>Size:</strong> ${sizeText}</p>
        <p><strong>Price:</strong> ${priceText}</p>
        <p><strong>Status:</strong> ${statusLabel}</p>
        <button data-id="${shoe.id}" class="inv-view-btn">View in Tracker</button>
      `;

      const btn = card.querySelector(".inv-view-btn");
      btn.addEventListener("click", () => {
        currentView = "all";
        showMainView();
        openShoeDetail(shoe.id);
      });

      inventoryListEl.appendChild(card);
    });
}

// ---------- Initial render ----------
showMainView();
