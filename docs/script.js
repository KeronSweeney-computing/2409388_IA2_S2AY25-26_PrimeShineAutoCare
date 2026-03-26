
/* =========================================================
   Web Programming (CIT2011) — Individual Assignment #2 (IA#2)
   Project: PrimeShine Auto Care
   External JavaScript only. Includes button-name alerts per lecturer.
   ========================================================= */

const IA2 = (() => {
  "use strict";

  // IA#2 JS: products data rendered with DOM manipulation
  const PRODUCTS = [
    {
      id: "p1",
      name: "GlossWash Car Wash Soap",
      price: 4200,
      img: "../Assets/car-wash-soap.jpg",
      desc: "High-foam wash soap for lifting road film, dust, and grime while leaving paint looking clean and bright.",
      tag1: "Exterior wash",
      tag2: "Foam rich"
    },
    {
      id: "p2",
      name: "UltraPlush Microfiber Towels",
      price: 3600,
      img: "../Assets/microfiber-towels.jpg",
      desc: "Soft scratch-safe towels for drying, buffing, wiping trim, and finishing glossy surfaces after a detail.",
      tag1: "Lint-free",
      tag2: "Detail safe"
    },
    {
      id: "p3",
      name: "WetLook Tire Shine",
      price: 2900,
      img: "../Assets/tire-shine.jpg",
      desc: "A clean deep-black finish for tires with an easy-to-apply shine that makes wheels look freshly detailed.",
      tag1: "Wheel care",
      tag2: "Gloss finish"
    },
    {
      id: "p4",
      name: "Royal Pine Air Freshener",
      price: 1800,
      img: "../Assets/air-freshener.jpg",
      desc: "Simple interior freshness for drivers who want the cabin to feel cleaner and more inviting every day.",
      tag1: "Interior care",
      tag2: "Fresh scent"
    },
    {
      id: "p5",
      name: "MirrorGloss Car Polish",
      price: 5100,
      img: "../Assets/polish.jpg",
      desc: "Restores depth and shine with a polished finish that helps the bodywork look sharp and presentation-ready.",
      tag1: "Paint care",
      tag2: "High shine"
    },
    {
      id: "p6",
      name: "QuickDetail Finishing Spray",
      price: 3400,
      img: "../Assets/spray.jpg",
      desc: "Final-step spray that refreshes gloss, removes light dust, and helps the vehicle leave with a crisp finish.",
      tag1: "Fast finish",
      tag2: "Detail spray"
    }
  ];

  const qs = (sel, scope = document) => scope.querySelector(sel);
  const qsa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (_err) {
        return fallback;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    del(key) {
      localStorage.removeItem(key);
    }
  };

  const money = (amount) => {
    try {
      return new Intl.NumberFormat("en-JM", { style: "currency", currency: "JMD" }).format(amount);
    } catch (_err) {
      return "JMD " + Number(amount).toFixed(2);
    }
  };

  // Lecturer requirement: alert() showing button name
  function alertButtonName(label) {
    window.alert(label);
  }

  // ---------------- Cart state ----------------
  const CART_KEY = "ia2_primeshine_cart";
  function loadCart() { return storage.get(CART_KEY, []); }
  function saveCart(items) { storage.set(CART_KEY, items); updateCartBadge(); }
  function clearCart() { saveCart([]); }

  function addToCart(productId, qty = 1) {
    const cart = loadCart();
    const found = cart.find((x) => x.id === productId);
    if (found) found.qty += qty;
    else cart.push({ id: productId, qty });
    saveCart(cart);
  }

  function removeFromCart(productId) {
    saveCart(loadCart().filter((x) => x.id !== productId));
  }

  function setQty(productId, qty) {
    const cart = loadCart();
    const item = cart.find((x) => x.id === productId);
    if (!item) return;
    item.qty = qty;
    if (item.qty <= 0) removeFromCart(productId);
    else saveCart(cart);
  }

  function cartCount() {
    return loadCart().reduce((sum, item) => sum + item.qty, 0);
  }

  function cartLines() {
    return loadCart().map((line) => {
      const p = PRODUCTS.find((x) => x.id === line.id);
      return p ? { ...p, qty: line.qty } : null;
    }).filter(Boolean);
  }

  // IA#2 JS: arithmetic + control structures
  function calcTotals(lines) {
    const subtotal = lines.reduce((sum, line) => sum + (line.price * line.qty), 0);
    let discountRate = 0;
    if (subtotal >= 15000) {
      discountRate = 0.10;
    } else if (subtotal >= 9000) {
      discountRate = 0.05;
    }

    const discount = subtotal * discountRate;
    const taxable = Math.max(0, subtotal - discount);
    const taxRate = 0.15;
    const tax = taxable * taxRate;
    const total = taxable + tax;

    return { subtotal, discount, tax, total, discountRate, taxRate };
  }

  // ---------------- Navigation ----------------
  function initNav() {
    const btn = qs("#navToggle");
    const nav = qs("#siteNav");
    if (!btn || !nav) return;

    // IA#2 JS: event listener #1
    btn.addEventListener("click", () => {
      alertButtonName("Menu Button");
      const open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  function setActiveNav() {
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    qsa(".site-nav a").forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === path) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function updateCartBadge() {
    const el = qs("#cartCount");
    if (el) el.textContent = String(cartCount());
  }

  // ---------------- Toast ----------------
  let toastTimer = null;
  function showToast(text) {
    const el = qs("#toast");
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { el.hidden = true; }, 1700);
  }

  // ---------------- Products ----------------
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderProducts(targetSelector, limit = null) {
    const host = qs(targetSelector);
    if (!host) return;

    const data = limit ? PRODUCTS.slice(0, limit) : PRODUCTS;
    host.innerHTML = data.map((p) => `
      <article class="card product">
        <img src="${p.img}" alt="${escapeHtml(p.name)} product image">
        <div class="stack">
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.desc)}</p>
          <div class="product-meta">
            <span class="tag">${escapeHtml(p.tag1)}</span>
            <span class="tag">${escapeHtml(p.tag2)}</span>
          </div>
          <div class="price-row">
            <span class="price">${money(p.price)}</span>
            <button class="btn primary" type="button" data-add="${p.id}">Add to Cart</button>
          </div>
        </div>
      </article>
    `).join("");

    // IA#2 JS: event listener #2
    host.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;
      alertButtonName("Add to Cart Button");
      addToCart(btn.getAttribute("data-add"), 1);
      showToast("Added to cart.");
    });
  }

  // ---------------- Cart page ----------------
  function renderCartPage() {
    const tableBody = qs("#cartBody");
    const emptyState = qs("#cartEmpty");
    const tableWrap = qs("#cartTableWrap");
    const totalsHost = qs("#cartTotals");
    if (!tableBody || !emptyState || !tableWrap || !totalsHost) return;

    const lines = cartLines();

    if (lines.length === 0) {
      emptyState.hidden = false;
      tableWrap.hidden = true;
      totalsHost.hidden = true;
      return;
    }

    emptyState.hidden = true;
    tableWrap.hidden = false;
    totalsHost.hidden = false;

    tableBody.innerHTML = lines.map((line) => `
      <tr>
        <td>
          <strong>${escapeHtml(line.name)}</strong><br>
          <small>${money(line.price)} each</small>
        </td>
        <td>
          <input class="qty-input" type="number" min="1" step="1" value="${line.qty}" data-qty="${line.id}"
            aria-label="Quantity for ${escapeHtml(line.name)}">
        </td>
        <td>${money(line.price * line.qty)}</td>
        <td>
          <button class="btn danger" type="button" data-remove="${line.id}">Remove</button>
        </td>
      </tr>
    `).join("");

    const totals = calcTotals(lines);
    totalsHost.innerHTML = `
      <div class="line"><span>Sub-total</span><strong>${money(totals.subtotal)}</strong></div>
      <div class="line"><span>Discount (${Math.round(totals.discountRate * 100)}%)</span><strong>- ${money(totals.discount)}</strong></div>
      <div class="line"><span>Tax (${Math.round(totals.taxRate * 100)}%)</span><strong>${money(totals.tax)}</strong></div>
      <div class="line grand"><span><strong>Total</strong></span><strong>${money(totals.total)}</strong></div>
    `;

    tableBody.addEventListener("input", (e) => {
      const input = e.target.closest("[data-qty]");
      if (!input) return;
      const id = input.getAttribute("data-qty");
      const qty = Number(input.value);
      if (Number.isFinite(qty)) {
        setQty(id, Math.max(1, Math.floor(qty)));
        renderCartPage();
      }
    }, { once: true });

    tableBody.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn) return;
      alertButtonName("Remove Button");
      removeFromCart(btn.getAttribute("data-remove"));
      renderCartPage();
      showToast("Item removed.");
    }, { once: true });
  }

  function initCartButtons() {
    const clearBtn = qs("#btnClearAll");
    const checkoutBtn = qs("#btnCheckout");
    const closeBtn = qs("#btnClose");

    if (clearBtn) clearBtn.addEventListener("click", () => {
      alertButtonName("Clear All Button");
      clearCart();
      renderCartPage();
      showToast("Cart cleared.");
    });
    if (checkoutBtn) checkoutBtn.addEventListener("click", () => {
      alertButtonName("Check Out Button");
      window.location.href = "checkout.html";
    });
    if (closeBtn) closeBtn.addEventListener("click", () => {
      alertButtonName("Close Button");
      window.location.href = "products.html";
    });
  }

  // ---------------- Checkout ----------------
  function renderCheckoutSummary() {
    const host = qs("#checkoutSummary");
    if (!host) return;

    const lines = cartLines();
    if (lines.length === 0) {
      host.innerHTML = `<p class="help">Your cart is empty. <a href="products.html">Go to Products</a>.</p>`;
      return;
    }

    const totals = calcTotals(lines);
    host.innerHTML = `
      <div class="stack">
        <div class="card table-wrap card-soft">
          <table aria-label="Checkout summary table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              ${lines.map((line) => `
                <tr>
                  <td>${escapeHtml(line.name)}</td>
                  <td>${line.qty}</td>
                  <td>${money(line.price * line.qty)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="card totals">
          <div class="line"><span>Sub-total</span><strong>${money(totals.subtotal)}</strong></div>
          <div class="line"><span>Discount</span><strong>- ${money(totals.discount)}</strong></div>
          <div class="line"><span>Tax</span><strong>${money(totals.tax)}</strong></div>
          <div class="line grand"><span><strong>Total to pay</strong></span><strong>${money(totals.total)}</strong></div>
        </div>
      </div>
    `;
  }

  function validateCheckout(data) {
    const errors = [];
    if (!data.fullname || String(data.fullname).trim().length < 2) errors.push("Enter your full name.");
    if (!data.address || String(data.address).trim().length < 5) errors.push("Enter a valid address.");
    if (!data.parish || String(data.parish).trim().length < 2) errors.push("Select a parish.");
    if (!data.amount || Number(data.amount) <= 0) errors.push("Enter the amount being paid.");
    return errors;
  }

  function initCheckoutForm() {
    const form = qs("#checkoutForm");
    const msg = qs("#checkoutMsg");
    if (!form || !msg) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alertButtonName("Confirm Button");

      const lines = cartLines();
      if (lines.length === 0) {
        msg.textContent = "Your cart is empty. Add products first.";
        msg.className = "error";
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      const errors = validateCheckout(data);

      if (errors.length) {
        msg.textContent = errors[0];
        msg.className = "error";
        return;
      }

      clearCart();
      renderCheckoutSummary();
      form.reset();
      msg.textContent = "Order confirmed. Demo checkout completed.";
      msg.className = "success";
      showToast("Checkout confirmed.");
    });
  }

  function initCheckoutButtons() {
    const cancelBtn = qs("#btnCancelCheckout");
    const closeBtn = qs("#btnCloseCheckout");
    const clearBtn = qs("#btnClearCheckout");

    if (cancelBtn) cancelBtn.addEventListener("click", () => {
      alertButtonName("Cancel Button");
      window.location.href = "cart.html";
    });
    if (closeBtn) closeBtn.addEventListener("click", () => {
      alertButtonName("Close Button");
      window.location.href = "products.html";
    });
    if (clearBtn) clearBtn.addEventListener("click", () => {
      alertButtonName("Clear All Button");
      clearCart();
      renderCheckoutSummary();
      updateCartBadge();
      showToast("Cart cleared.");
    });
  }

  // ---------------- Login/Register ----------------
  const USERS_KEY = "ia2_primeshine_users";
  const SESSION_KEY = "ia2_primeshine_session";

  function loadUsers() {
    return storage.get(USERS_KEY, []);
  }

  function saveUsers(users) {
    storage.set(USERS_KEY, users);
  }

  function setSession(username) {
    storage.set(SESSION_KEY, { username, at: Date.now() });
    updateAuthUI();
  }

  function clearSession() {
    storage.del(SESSION_KEY);
    updateAuthUI();
  }

  function getSession() {
    return storage.get(SESSION_KEY, null);
  }

  function isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  function isStrongPassword(password) {
    const value = String(password || "");
    return value.length >= 8 && /\d/.test(value);
  }

  function validateRegister(data) {
    const errors = [];
    if (!data.fullname || String(data.fullname).trim().length < 2) errors.push("Enter your full name.");
    if (!data.dob) errors.push("Select your date of birth.");
    if (!isEmail(data.email)) errors.push("Enter a valid email address.");
    if (!data.username || String(data.username).trim().length < 4) errors.push("Username must be at least 4 characters.");
    if (!isStrongPassword(data.password)) errors.push("Password must be at least 8 characters and include a number.");
    if (String(data.password) !== String(data.confirm)) errors.push("Passwords do not match.");
    return errors;
  }

  function initRegisterForm() {
    const form = qs("#registerForm");
    const msg = qs("#registerMsg");
    if (!form || !msg) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alertButtonName("Create Account Button");
      const data = Object.fromEntries(new FormData(form).entries());
      const errors = validateRegister(data);

      if (errors.length) {
        msg.textContent = errors[0];
        msg.className = "error";
        return;
      }

      const users = loadUsers();
      const exists = users.some((user) => user.username.toLowerCase() === String(data.username).trim().toLowerCase());
      if (exists) {
        msg.textContent = "That username already exists.";
        msg.className = "error";
        return;
      }

      users.push({
        fullname: String(data.fullname).trim(),
        dob: data.dob,
        email: String(data.email).trim(),
        username: String(data.username).trim(),
        password: String(data.password)
      });
      saveUsers(users);
      form.reset();
      msg.textContent = "Registration successful. You can log in now.";
      msg.className = "success";
    });
  }

  function initLoginForm() {
    const form = qs("#loginForm");
    const msg = qs("#loginMsg");
    if (!form || !msg) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alertButtonName("Log In Button");
      const data = Object.fromEntries(new FormData(form).entries());
      const users = loadUsers();
      const user = users.find((item) =>
        item.username.toLowerCase() === String(data.username).trim().toLowerCase() &&
        item.password === String(data.password)
      );

      if (!user) {
        msg.textContent = "Invalid username or password.";
        msg.className = "error";
        return;
      }

      setSession(user.username);
      form.reset();
      msg.textContent = "Login successful.";
      msg.className = "success";
      setTimeout(() => { window.location.href = "products.html"; }, 450);
    });
  }

  function updateAuthUI() {
    const host = qs("#authStatus");
    const userSpan = qs("#sessionUser");
    const loginLinks = qsa("[data-auth='login']");
    const logoutBtn = qs("[data-auth='logout']");
    const session = getSession();

    if (host) host.hidden = false;
    if (userSpan) userSpan.textContent = session ? session.username : "Guest";
    loginLinks.forEach((link) => { link.hidden = Boolean(session); });
    if (logoutBtn) logoutBtn.hidden = !session;
  }

  function initLogout() {
    const btn = qs("[data-auth='logout']");
    if (!btn) return;
    btn.addEventListener("click", () => {
      alertButtonName("Logout Button");
      clearSession();
      showToast("Logged out.");
      window.location.href = "index.html";
    });
  }

  function init() {
    initNav();
    setActiveNav();
    updateCartBadge();
    updateAuthUI();
    initLogout();

    renderProducts("#featuredGrid", 3);
    renderProducts("#productsGrid");
    renderCartPage();
    initCartButtons();
    renderCheckoutSummary();
    initCheckoutForm();
    initCheckoutButtons();
    initRegisterForm();
    initLoginForm();
  }

  return { init, PRODUCTS, calcTotals };
})();

document.addEventListener("DOMContentLoaded", IA2.init);
