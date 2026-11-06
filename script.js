/* =====================================================
   STYLEHUB — script.js
   Sections:
   1. Product data
   2. State (filters, cart, wishlist) + localStorage
   3. Small helper functions
   4. Rendering (products, cart, wishlist)
   5. Filtering, sorting and searching
   6. Cart functions
   7. Wishlist functions
   8. UI: drawers, mobile menu, search bar, toast
   9. Newsletter validation
  10. Event listeners & start-up
   ===================================================== */

"use strict";

/* ---------- 1. PRODUCT DATA ----------
   Add or edit products here. Prices are in Indian Rupees (₹).
   - price:    the price the customer pays
   - original: the old price (only for discounted items)
   - badge:    "sale", "new" or null                                  */

// Builds an image URL. To use your own pictures, put them in assets/images/
// and replace the `image` values below, e.g. "assets/images/shirt.jpg"
const photo = (id, width = 700) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

// Shown if an image can't be loaded (for example when you are offline)
const FALLBACK_IMAGE = "assets/images/placeholder.svg";

const PRODUCTS = [
  { id: 1,  name: "Essential Cotton Crew Tee",    category: "men",         price: 799,  original: null, rating: 4.4, reviews: 212, badge: "new",  image: photo("photo-1521572163474-6864f9cf17ab") },
  { id: 2,  name: "Urban Leather Biker Jacket",   category: "men",         price: 5999, original: 7999, rating: 4.7, reviews: 98,  badge: "sale", image: photo("photo-1551028719-00167b16eac5") },
  { id: 3,  name: "Slim Fit Indigo Denim",        category: "men",         price: 1999, original: 2799, rating: 4.3, reviews: 164, badge: "sale", image: photo("photo-1542272604-787c3835535d") },
  { id: 4,  name: "Tailored Charcoal Blazer",     category: "men",         price: 4499, original: null, rating: 4.6, reviews: 57,  badge: "new",  image: photo("photo-1594938298603-c8148c4dae35") },
  { id: 5,  name: "Floral Summer Midi Dress",     category: "women",       price: 2299, original: 3299, rating: 4.5, reviews: 183, badge: "sale", image: photo("photo-1496747611176-843222e1e57c") },
  { id: 6,  name: "Linen Wrap Co-ord Set",        category: "women",       price: 2799, original: null, rating: 4.2, reviews: 74,  badge: "new",  image: photo("photo-1539109136881-3be0616acf4b") },
  { id: 7,  name: "Pastel Knit Cardigan",         category: "women",       price: 1899, original: null, rating: 4.4, reviews: 121, badge: null,   image: photo("photo-1434389677669-e08b4cac3105") },
  { id: 8,  name: "Satin Evening Gown",           category: "women",       price: 5499, original: 6999, rating: 4.8, reviews: 66,  badge: "sale", image: photo("photo-1515886657613-9f3515b0c78f") },
  { id: 9,  name: "Velocity Runner Sneakers",     category: "shoes",       price: 3499, original: null, rating: 4.6, reviews: 240, badge: "new",  image: photo("photo-1542291026-7eec264c27ff") },
  { id: 10, name: "Street Classic Sneakers",      category: "shoes",       price: 2999, original: 3999, rating: 4.3, reviews: 139, badge: "sale", image: photo("photo-1491553895911-0055eca6402d") },
  { id: 11, name: "Structured Tote Handbag",      category: "accessories", price: 2499, original: 3499, rating: 4.5, reviews: 88,  badge: "sale", image: photo("photo-1584917865442-de89df76afd3") },
  { id: 12, name: "Classic Aviator Sunglasses",   category: "accessories", price: 1299, original: null, rating: 4.1, reviews: 301, badge: "new",  image: photo("photo-1572635196237-14b3f281503f") },
  { id: 13, name: "Canvas Everyday Backpack",     category: "accessories", price: 1799, original: null, rating: 4.4, reviews: 156, badge: null,   image: photo("photo-1553062407-98eeb64c6a62") }
];

const CATEGORY_NAMES = { men: "Men", women: "Women", accessories: "Accessories", shoes: "Shoes" };

/* ---------- 2. STATE + LOCAL STORAGE ---------- */

// Current filter choices
const state = {
  filter: "all",     // all | men | women | accessories | shoes | new | sale
  price: "all",      // "all" or "min-max"
  sort: "featured",  // featured | low-high | high-low
  search: ""
};

const CART_KEY = "stylehub_cart";
const WISHLIST_KEY = "stylehub_wishlist";

// Read a saved value from localStorage (returns `fallback` if nothing saved or data is broken)
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

// Save a value to localStorage (ignored quietly if storage is blocked)
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    /* storage unavailable — the site still works, it just won't remember */
  }
}

// cart     = [{ id: 1, qty: 2 }, ...]
// wishlist = [1, 5, 9, ...]  (product ids)
let cart = loadFromStorage(CART_KEY, []).filter(item => findProduct(item.id));
let wishlist = loadFromStorage(WISHLIST_KEY, []).filter(id => findProduct(id));

/* ---------- 3. HELPER FUNCTIONS ---------- */

// Shortcuts for finding elements
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function findProduct(id) {
  return PRODUCTS.find(product => product.id === Number(id));
}

// 2999 -> "₹2,999" (Indian digit grouping)
function formatPrice(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

// Discount percentage, e.g. 7999 -> 5999 = 25
function discountPercent(product) {
  return Math.round(((product.original - product.price) / product.original) * 100);
}

// Builds the five stars for a rating
function starsHTML(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.round(rating) ? " filled" : "";
    html += `<svg class="icon${filled}" aria-hidden="true"><use href="#i-star"/></svg>`;
  }
  return html;
}

// Basic protection: product text is inserted into HTML, so escape special characters
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* ---------- 4. RENDERING ---------- */

const productGrid = $("#productGrid");
const noResults = $("#noResults");
const resultInfo = $("#resultInfo");

// Builds the HTML for one product card
function productCardHTML(product) {
  const inWishlist = wishlist.includes(product.id);
  const badge = product.badge
    ? `<span class="badge badge-${product.badge}">${product.badge === "sale" ? "Sale" : "New"}</span>`
    : "";
  const priceHTML = product.original
    ? `<span class="now">${formatPrice(product.price)}</span>
       <span class="was">${formatPrice(product.original)}</span>
       <span class="off">${discountPercent(product)}% off</span>`
    : `<span class="now">${formatPrice(product.price)}</span>`;

  return `
    <article class="product-card">
      <div class="product-media">
        <img src="${product.image}" alt="${escapeHTML(product.name)}" loading="lazy">
        ${badge}
        <button class="wish-btn ${inWishlist ? "active" : ""}" data-action="wishlist" data-id="${product.id}"
                aria-label="${inWishlist ? "Remove from" : "Add to"} wishlist" aria-pressed="${inWishlist}">
          <svg class="icon" aria-hidden="true"><use href="#i-heart"/></svg>
        </button>
        <button class="add-btn" data-action="add" data-id="${product.id}">Add to Cart</button>
      </div>
      <div class="product-info">
        <p class="product-cat">${CATEGORY_NAMES[product.category]}</p>
        <h3 class="product-name">${escapeHTML(product.name)}</h3>
        <div class="rating" aria-label="Rated ${product.rating} out of 5">
          ${starsHTML(product.rating)}<span>${product.rating} (${product.reviews})</span>
        </div>
        <div class="price">${priceHTML}</div>
      </div>
    </article>`;
}

// Draws the product grid using the current filters
function renderProducts() {
  const list = getVisibleProducts();

  productGrid.innerHTML = list.map(productCardHTML).join("");
  noResults.hidden = list.length > 0;
  resultInfo.textContent = list.length
    ? `Showing ${list.length} of ${PRODUCTS.length} products`
    : "";
}

// Draws the cart drawer contents and updates the header counter
function renderCart() {
  const container = $("#cartItems");
  const footer = $("#cartFooter");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-msg">
        <p>Your cart is empty.</p>
        <button class="btn btn-dark" data-close-drawer>Continue Shopping</button>
      </div>`;
    footer.hidden = true;
  } else {
    container.innerHTML = cart.map(item => {
      const product = findProduct(item.id);
      return `
        <div class="line-item">
          <img src="${product.image}" alt="${escapeHTML(product.name)}">
          <div class="line-info">
            <h4>${escapeHTML(product.name)}</h4>
            <div class="line-price">${formatPrice(product.price * item.qty)}</div>
            <div class="line-actions">
              <div class="qty">
                <button data-action="decrease" data-id="${product.id}" aria-label="Decrease quantity">&minus;</button>
                <span aria-live="polite">${item.qty}</span>
                <button data-action="increase" data-id="${product.id}" aria-label="Increase quantity">+</button>
              </div>
              <button class="remove-btn" data-action="remove" data-id="${product.id}">Remove</button>
            </div>
          </div>
        </div>`;
    }).join("");
    footer.hidden = false;
  }

  $("#cartTotal").textContent = formatPrice(getCartTotal());
  $("#cartCount").textContent = getCartCount();
  attachImageFallbacks();
}

// Draws the wishlist drawer contents and updates the header counter
function renderWishlist() {
  const container = $("#wishlistItems");

  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="empty-msg">
        <p>Your wishlist is empty.<br>Tap the heart on any product to save it.</p>
        <button class="btn btn-dark" data-close-drawer>Browse Products</button>
      </div>`;
  } else {
    container.innerHTML = wishlist.map(id => {
      const product = findProduct(id);
      return `
        <div class="line-item">
          <img src="${product.image}" alt="${escapeHTML(product.name)}">
          <div class="line-info">
            <h4>${escapeHTML(product.name)}</h4>
            <div class="line-price">${formatPrice(product.price)}</div>
            <div class="line-actions">
              <button class="mini-add" data-action="add" data-id="${product.id}">Add to Cart</button>
              <button class="remove-btn" data-action="wishlist" data-id="${product.id}">Remove</button>
            </div>
          </div>
        </div>`;
    }).join("");
  }

  $("#wishlistCount").textContent = wishlist.length;
  attachImageFallbacks();
}

// If an image fails to load, swap in the local placeholder
function attachImageFallbacks() {
  $$("img").forEach(img => {
    if (img.dataset.fallbackReady) return;
    img.dataset.fallbackReady = "true";
    img.addEventListener("error", () => {
      if (!img.src.endsWith(FALLBACK_IMAGE)) img.src = FALLBACK_IMAGE;
    });
    // Handle images that already failed before the listener was added
    if (img.complete && img.naturalWidth === 0) img.src = FALLBACK_IMAGE;
  });
}

/* ---------- 5. FILTERING, SORTING AND SEARCHING ---------- */

// Returns the products that match every active filter, sorted as chosen
function getVisibleProducts() {
  let list = PRODUCTS.filter(product => {
    // Category / badge filter
    if (state.filter === "new" && product.badge !== "new") return false;
    if (state.filter === "sale" && !product.original) return false;
    if (CATEGORY_NAMES[state.filter] && product.category !== state.filter) return false;

    // Price range filter ("min-max")
    if (state.price !== "all") {
      const [min, max] = state.price.split("-").map(Number);
      if (product.price < min || product.price > max) return false;
    }

    // Search by name (also matches the category name)
    const term = state.search.trim().toLowerCase();
    if (term) {
      const text = `${product.name} ${CATEGORY_NAMES[product.category]}`.toLowerCase();
      if (!text.includes(term)) return false;
    }
    return true;
  });

  // Sorting (copy first so the original order stays untouched)
  if (state.sort === "low-high") list = [...list].sort((a, b) => a.price - b.price);
  if (state.sort === "high-low") list = [...list].sort((a, b) => b.price - a.price);
  return list;
}

// Applies a category/badge filter and updates the highlighted chip + nav link
function setFilter(filter) {
  state.filter = filter;
  $$("#categoryChips .chip").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.filter === filter);
  });
  highlightNav(["men", "women", "new", "sale"].includes(filter) ? filter : "home");
  renderProducts();
  attachImageFallbacks();
}

// Puts the "active" underline on the matching nav link
function highlightNav(name) {
  $$(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.nav === name));
}

// Clears every filter, the search box and the sort
function resetFilters() {
  state.price = "all";
  state.sort = "featured";
  state.search = "";
  $("#priceFilter").value = "all";
  $("#sortSelect").value = "featured";
  $("#searchInput").value = "";
  setFilter("all");
}

/* ---------- 6. CART FUNCTIONS ---------- */

function saveCart() {
  saveToStorage(CART_KEY, cart);
  renderCart();
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + findProduct(item.id).price * item.qty, 0);
}

// Adds one unit of a product (or increases quantity if already in the cart)
function addToCart(id) {
  id = Number(id);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  showToast(`${findProduct(id).name} added to cart`);
}

function increaseQty(id) {
  const item = cart.find(entry => entry.id === Number(id));
  if (item) item.qty += 1;
  saveCart();
}

// Decreasing from 1 removes the item
function decreaseQty(id) {
  const item = cart.find(entry => entry.id === Number(id));
  if (!item) return;
  item.qty -= 1;
  if (item.qty <= 0) cart = cart.filter(entry => entry.id !== item.id);
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== Number(id));
  saveCart();
}

function clearCart() {
  cart = [];
  saveCart();
}

/* ---------- 7. WISHLIST FUNCTIONS ---------- */

// Adds the product if it isn't saved yet, otherwise removes it
function toggleWishlist(id) {
  id = Number(id);
  const name = findProduct(id).name;

  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(savedId => savedId !== id);
    showToast(`${name} removed from wishlist`);
  } else {
    wishlist.push(id);
    showToast(`${name} added to wishlist`);
  }
  saveToStorage(WISHLIST_KEY, wishlist);
  renderWishlist();
  renderProducts();          // refresh the heart icons on the cards
  attachImageFallbacks();
}

/* ---------- 8. UI: DRAWERS, MOBILE MENU, SEARCH BAR, TOAST ---------- */

const overlay = $("#overlay");
const mainNav = $("#mainNav");
const menuToggle = $("#menuToggle");
const searchBar = $("#searchBar");
const searchToggle = $("#searchToggle");

// Closes everything that is open on top of the page (drawers + mobile menu)
function closePanels() {
  $$(".drawer").forEach(drawer => {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  });
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  overlay.classList.remove("show");
  document.body.classList.remove("no-scroll", "menu-open");
}

function openDrawer(drawerId) {
  closePanels();
  const drawer = $(drawerId);
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.classList.add("show");
  document.body.classList.add("no-scroll");
}

function toggleMobileMenu() {
  const willOpen = !mainNav.classList.contains("open");
  closePanels();
  if (willOpen) {
    mainNav.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    overlay.classList.add("show");
    document.body.classList.add("no-scroll", "menu-open");
  }
}

function toggleSearchBar() {
  const willOpen = searchBar.hidden;
  searchBar.hidden = !willOpen;
  searchToggle.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) $("#searchInput").focus();
}

// Small pop-up message at the bottom of the screen
let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------- 9. NEWSLETTER VALIDATION ---------- */

// Simple email check: something@something.something (no spaces)
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function handleNewsletter(event) {
  event.preventDefault();
  const input = $("#newsEmail");
  const message = $("#newsMessage");
  const email = input.value.trim();

  if (email === "") {
    showNewsletterMessage(input, message, "Please enter your email address.", false);
  } else if (!isValidEmail(email)) {
    showNewsletterMessage(input, message, "Please enter a valid email address (e.g. name@example.com).", false);
  } else {
    showNewsletterMessage(input, message, "Thank you for subscribing! Welcome to the STYLEHUB Club.", true);
    input.value = "";
  }
}

function showNewsletterMessage(input, message, text, success) {
  message.textContent = text;
  message.className = "form-message " + (success ? "success" : "error");
  input.classList.toggle("invalid", !success);
}

/* ---------- 10. EVENT LISTENERS & START-UP ---------- */

// One click listener on the document handles every button that has a
// data-action attribute (this is called "event delegation"). It keeps working
// even though product cards and cart rows are re-drawn by JavaScript.
document.addEventListener("click", event => {
  const target = event.target.closest("[data-action]");
  if (target) {
    const { action, id } = target.dataset;
    if (action === "add") addToCart(id);
    if (action === "wishlist") toggleWishlist(id);
    if (action === "increase") increaseQty(id);
    if (action === "decrease") decreaseQty(id);
    if (action === "remove") removeFromCart(id);
    return;
  }

  // Any element marked data-close-drawer closes the open panel
  if (event.target.closest("[data-close-drawer]")) closePanels();
});

// Header buttons
$("#cartBtn").addEventListener("click", () => openDrawer("#cartDrawer"));
$("#wishlistBtn").addEventListener("click", () => openDrawer("#wishlistDrawer"));
menuToggle.addEventListener("click", toggleMobileMenu);
searchToggle.addEventListener("click", toggleSearchBar);
overlay.addEventListener("click", closePanels);
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closePanels();
});

// Cart drawer buttons
$("#clearCartBtn").addEventListener("click", clearCart);
$("#checkoutBtn").addEventListener("click", () => {
  closePanels();
  showToast("Checkout is not part of this demo — thanks for shopping!");
});

// Navigation links (Men / Women / New Arrivals / Sale / Home)
$$(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    const name = link.dataset.nav;
    closePanels();
    if (name === "home") {
      resetFilters();
    } else {
      state.search = "";
      $("#searchInput").value = "";
      setFilter(name);
    }
  });
});

// Category cards, "Shop Now" buttons and the footer Sale link
$$("[data-category]").forEach(card => {
  card.addEventListener("click", () => setFilter(card.dataset.category));
});
$$("[data-shop-all]").forEach(button => {
  button.addEventListener("click", resetFilters);
});
$$("[data-promo-sale]").forEach(button => {
  button.addEventListener("click", () => setFilter("sale"));
});

// Filter chips
$("#categoryChips").addEventListener("click", event => {
  const chip = event.target.closest(".chip");
  if (chip) setFilter(chip.dataset.filter);
});

// Price filter, sort dropdown, live search
$("#priceFilter").addEventListener("change", event => {
  state.price = event.target.value;
  renderProducts();
  attachImageFallbacks();
});
$("#sortSelect").addEventListener("change", event => {
  state.sort = event.target.value;
  renderProducts();
  attachImageFallbacks();
});
$("#searchInput").addEventListener("input", event => {
  state.search = event.target.value;
  renderProducts();
  attachImageFallbacks();
});
// Pressing Enter in the search box jumps down to the results
$("#searchInput").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    $("#products").scrollIntoView({ behavior: "smooth" });
  }
});

$("#resetFilters").addEventListener("click", resetFilters);
$("#newsletterForm").addEventListener("submit", handleNewsletter);

// Start-up: draw everything once when the page loads
$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
renderWishlist();
attachImageFallbacks();
