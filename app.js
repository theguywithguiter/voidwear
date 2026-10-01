const products = [
  { id: 1, name: 'Void Heavyweight Tee', color: 'Washed Black', tone: 'black', price: 699, image: 'tee1.png', back: 'tee1-back.png', badge: 'Core' },
  { id: 2, name: 'Static Oversized Tee', color: 'Faded Graphite', tone: 'grey', price: 799, image: 'tee2.png', back: 'tee2-back.png', badge: 'New' },
  { id: 3, name: 'After Hours Tee', color: 'Oil Black', tone: 'black', price: 799, image: 'tee3.png', back: 'tee3-back.png', badge: 'Core' },
  { id: 4, name: 'Tonal Mark Tee', color: 'Concrete', tone: 'grey', price: 699, image: 'tee4.png', back: 'tee4-back.png', badge: '' },
  { id: 5, name: 'The Heavyweight Tee', color: 'Vintage Black', tone: 'black', price: 1099, image: 'tee5.png', badge: 'Best seller' },
  { id: 6, name: 'Field Study Tee', color: 'Moss', tone: 'earth', price: 799, image: 'tee6.png', badge: '' },
  { id: 7, name: 'Future Relic Tee', color: 'Clay', tone: 'earth', price: 1099, image: 'tee7.png', badge: 'Limited' },
  { id: 8, name: 'Essentials Tee', color: 'Bone', tone: 'grey', price: 699, image: 'tee8.png', badge: '' }
];

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const getProduct = (id) => products.find((product) => product.id === Number(id)) || products[0];
const imagePath = (file) => `images/${file}`;
const USERS_KEY = 'voidwear-users';
const SESSION_KEY = 'voidwear-session';
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}
function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
}
async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
function createSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function getCart() {
  try { return JSON.parse(localStorage.getItem('voidwear-cart')) || []; } catch { return []; }
}
function setCart(cart) { localStorage.setItem('voidwear-cart', JSON.stringify(cart)); updateCartCount(); }
function cartQuantity() { return getCart().reduce((total, item) => total + item.quantity, 0); }
function cartSubtotal() { return getCart().reduce((total, item) => total + getProduct(item.id).price * item.quantity, 0); }
function updateCartCount() {
  const count = cartQuantity();
  $$('.cart-amount').forEach((node) => { node.textContent = count; });
  const bagCount = $('#bag-count');
  if (bagCount) bagCount.textContent = `(${count})`;
}
function showToast(message) {
  let toast = $('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.append(toast); }
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}
function addToCart(id, size = 'M') {
  const cart = getCart();
  const found = cart.find((item) => item.id === Number(id) && item.size === size);
  if (found) found.quantity += 1;
  else cart.push({ id: Number(id), size, quantity: 1 });
  setCart(cart);
  showToast(`${getProduct(id).name} added to your bag.`);
}

function renderHeader() {
  const page = document.body.dataset.page;
  const session = getSession();
  const accountAction = session
    ? `<span class="account-name">Hi, ${escapeHtml(session.name.split(' ')[0])}</span><button class="logout-button" type="button" data-logout>Log out</button>`
    : `<a href="login.html">Log in</a>`;
  const mobileAccountAction = session
    ? `<button class="mobile-logout" type="button" data-logout>Log out</button>`
    : `<a href="login.html">Log in</a>`;
  $('#site-header').innerHTML = `
    <header class="site-header">
      <a class="brand" href="index.html" aria-label="VOIDWEAR home">VOIDWEAR</a>
      <nav class="nav" aria-label="Main navigation">
        <a class="${page === 'home' ? 'is-active' : ''}" href="index.html">Home</a>
        <a class="${page === 'shop' || page === 'product' ? 'is-active' : ''}" href="shop.html">Shop</a>
        <a class="${page === 'about' ? 'is-active' : ''}" href="about.html">About</a>
      </nav>
      <div class="header-actions"><a href="shop.html" aria-label="Search collection"></a>${accountAction}<a href="cart.html" class="cart-link">Bag <span class="cart-amount">0</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">Menu</button></div>
    </header>
    <nav class="nav-panel" id="mobile-menu" aria-label="Mobile navigation"><a href="index.html">Home</a><a href="shop.html">Shop</a><a href="about.html">About</a><a href="cart.html">Your bag <span class="cart-amount">0</span></a>${mobileAccountAction}</nav>`;
  $('.menu-toggle').addEventListener('click', () => {
    const menu = $('.nav-panel'); const open = menu.classList.toggle('is-open');
    $('.menu-toggle').setAttribute('aria-expanded', String(open)); $('.menu-toggle').textContent = open ? 'Close' : 'Menu';
  });
  $$('[data-logout]').forEach((button) => button.addEventListener('click', () => { localStorage.removeItem(SESSION_KEY); showToast('You have been logged out.'); renderHeader(); }));
  updateCartCount();
}
function renderFooter() {
  $('#site-footer').innerHTML = `<footer class="site-footer"><div class="footer-top"><div><a href="index.html" class="footer-brand">VOIDWEAR</a><p class="footer-tagline">Oversized essentials for the hours in between.</p></div><div class="footer-links"><div><p>Explore</p><a href="shop.html">Shop all</a><a href="shop.html?filter=black">Core collection</a><a href="cart.html">Your bag</a></div><div><p>Info</p><a href="about.html">Our story</a><a href="shop.html">Size guide</a><a href="shop.html">Shipping & returns</a></div><div><p>Follow</p><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a><a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest</a><a href="mailto:hello@voidwear.co">Contact</a></div></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} VOIDWEAR</span><span>Designed for the void.</span></div></footer>`;
}
function productCard(product) {
  return `<article class="product-card"><a href="product.html?id=${product.id}" class="product-card__visual" aria-label="View ${product.name}"><img src="${imagePath(product.image)}" alt="${product.color} ${product.name}" loading="lazy" />${product.badge ? `<span class="product-card__tag">${product.badge}</span>` : ''}<button class="quick-add" type="button" data-quick-add="${product.id}" aria-label="Add ${product.name} to bag">+</button></a><div class="product-card__info"><a href="product.html?id=${product.id}" class="product-card__name">${product.name}</a><span class="product-card__color">${product.color}</span><span class="product-card__price">${currency.format(product.price)}</span></div></article>`;
}
function bindQuickAdd(parent = document) {
  $$('[data-quick-add]', parent).forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); addToCart(button.dataset.quickAdd); }));
}
function renderHome() {
  const slot = $('#featured-products');
  if (!slot) return;
  slot.innerHTML = products.slice(0, 4).map(productCard).join('');
  bindQuickAdd(slot);
  $('[data-newsletter]')?.addEventListener('submit', (event) => {
    event.preventDefault(); const status = $('.newsletter__status'); status.textContent = 'You’re on the list. Welcome to the void.'; event.currentTarget.reset();
  });
}
function renderShop() {
  const grid = $('#shop-products');
  if (!grid) return;
  const initialFilter = new URLSearchParams(location.search).get('filter') || 'all';
  let filter = initialFilter; let sort = 'featured';
  function draw() {
    const ordered = products.filter((item) => filter === 'all' || item.tone === filter).sort((a, b) => {
      if (sort === 'low') return a.price - b.price;
      if (sort === 'high') return b.price - a.price;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return a.id - b.id;
    });
    grid.innerHTML = ordered.map(productCard).join(''); bindQuickAdd(grid);
  }
  $$('.filter-tabs button').forEach((button) => {
    const selected = button.dataset.filter === filter; button.classList.toggle('is-active', selected); button.setAttribute('aria-selected', String(selected));
    button.addEventListener('click', () => { filter = button.dataset.filter; $$('.filter-tabs button').forEach((item) => { const on = item === button; item.classList.toggle('is-active', on); item.setAttribute('aria-selected', String(on)); }); draw(); });
  });
  $('#sort-products').addEventListener('change', (event) => { sort = event.target.value; draw(); });
  draw();
}
function galleryImage(file, product, view) { return `<div class="product-gallery__image"><img src="${imagePath(file)}" alt="${product.color} ${product.name}, ${view} view" /></div>`; }
function renderProduct() {
  const root = $('#product-detail'); if (!root) return;
  const product = getProduct(new URLSearchParams(location.search).get('id'));
  const swatches = products.filter((item) => item.name === product.name || item.id === product.id).slice(0, 3);
  const tones = { black: '#171716', grey: '#777671', earth: '#8d7759' };
  const gallery = product.back ? `${galleryImage(product.image, product, 'front')}${galleryImage(product.back, product, 'back')}${galleryImage(product.image, product, 'detail')}${galleryImage(product.back, product, 'oversized fit')}` : `${galleryImage(product.image, product, 'front')}${galleryImage(product.image, product, 'detail')}`;
  root.innerHTML = `<div class="product-gallery">${gallery}</div><div class="product-info"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="shop.html">Shop</a><span>/</span><span>${product.name}</span></nav><p class="eyebrow">Drop 01 / ${product.badge || 'Core piece'}</p><h1>${product.name}</h1><p class="product-info__price">${currency.format(product.price)}</p><p class="product-info__description">An oversized, heavyweight tee with a clean profile and a lived-in finish. Cut to sit lower on the shoulder and move independently of the body.</p><div class="color-label"><label>Color</label><span>${product.color}</span></div><div class="swatches" aria-label="Available colors">${swatches.map((item, index) => `<a href="product.html?id=${item.id}" class="swatch ${index === 0 ? 'is-active' : ''}" style="--swatch:${tones[item.tone]}" aria-label="${item.color}"></a>`).join('')}</div><div class="size-label"><label>Size</label><a href="shop.html" title="Oversized fit size guide">Size guide</a></div><div class="sizes" role="group" aria-label="Select size">${['XS','S','M','L'].map((size) => `<button class="size-button ${size === 'M' ? 'is-active' : ''}" type="button" data-size="${size}">${size}</button>`).join('')}</div><button class="add-product" type="button" data-add-product="${product.id}"><span>Add to bag</span><span>${currency.format(product.price)}</span></button><div class="product-details"><button class="detail-row" type="button" aria-expanded="false">Details <span>+</span></button><p class="detail-content">240gsm 100% combed cotton. Relaxed oversized body, dropped shoulder and slightly cropped hem. Garment washed for a softened finish.</p><button class="detail-row" type="button" aria-expanded="false">Fit & sizing <span>+</span></button><p class="detail-content">Designed for an oversized fit. Take your regular size for the intended silhouette, or size down for a closer shape.</p><button class="detail-row" type="button" aria-expanded="false">Shipping & returns <span>+</span></button><p class="detail-content">Orders dispatch in 1–2 working days. Returns are accepted within 14 days of delivery in unworn condition.</p></div></div>`;
  let selectedSize = 'M';
  $$('.size-button', root).forEach((button) => button.addEventListener('click', () => { selectedSize = button.dataset.size; $$('.size-button', root).forEach((item) => item.classList.toggle('is-active', item === button)); }));
  $('[data-add-product]', root).addEventListener('click', () => addToCart(product.id, selectedSize));
  $$('.detail-row', root).forEach((button) => button.addEventListener('click', () => { const content = button.nextElementSibling; const open = content.classList.toggle('is-open'); button.setAttribute('aria-expanded', String(open)); $('span', button).textContent = open ? '–' : '+'; }));
  const related = $('#related-products');
  related.innerHTML = products.filter((item) => item.id !== product.id).slice(0, 4).map(productCard).join(''); bindQuickAdd(related);
}
function renderCart() {
  const root = $('#cart-content'); if (!root) return;
  const cart = getCart(); const count = cartQuantity();
  $('#bag-count').textContent = `(${count})`;
  if (!cart.length) { root.innerHTML = `<div class="empty-cart"><div><p class="eyebrow">Nothing here yet</p><h2>Your bag is empty.</h2><p>Find a form worth living in.</p><a href="shop.html" class="button button--light">Shop the drop <span>↗</span></a></div></div>`; return; }
  const subtotal = cartSubtotal(); const shipping = subtotal >= 999 ? 0 : 99; const total = subtotal + shipping;
  root.innerHTML = `<div class="cart-layout"><section class="cart-items" aria-label="Bag items">${cart.map((item) => { const product = getProduct(item.id); return `<article class="cart-item"><a class="cart-item__image" href="product.html?id=${product.id}"><img src="${imagePath(product.image)}" alt="${product.name}" /></a><div><a href="product.html?id=${product.id}" class="cart-item__name">${product.name}</a><p class="cart-item__meta">${product.color} / Size ${item.size}</p><div class="qty-controls" aria-label="Quantity for ${product.name}"><button type="button" data-change-qty="${item.id}" data-size="${item.size}" data-step="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-change-qty="${item.id}" data-size="${item.size}" data-step="1" aria-label="Increase quantity">+</button></div></div><div class="cart-item__side"><span class="cart-item__price">${currency.format(product.price * item.quantity)}</span><button class="remove-item" type="button" data-remove="${item.id}" data-size="${item.size}">Remove</button></div></article>`; }).join('')}</section><aside class="order-summary"><h2>Order summary</h2><div class="summary-row"><span>Subtotal</span><span>${currency.format(subtotal)}</span></div><div class="summary-row"><span>Shipping</span><span>${shipping ? currency.format(shipping) : 'Free'}</span></div><div class="summary-row summary-row--total"><span>Total</span><span>${currency.format(total)}</span></div><button class="checkout" type="button">Checkout securely</button><p class="summary-note">Taxes and any duties are calculated at checkout.</p></aside></div>`;
  $$('[data-change-qty]', root).forEach((button) => button.addEventListener('click', () => { const next = getCart().map((item) => item.id === Number(button.dataset.changeQty) && item.size === button.dataset.size ? { ...item, quantity: item.quantity + Number(button.dataset.step) } : item).filter((item) => item.quantity > 0); setCart(next); renderCart(); }));
  $$('[data-remove]', root).forEach((button) => button.addEventListener('click', () => { setCart(getCart().filter((item) => !(item.id === Number(button.dataset.remove) && item.size === button.dataset.size))); renderCart(); showToast('Item removed from your bag.'); }));
  $('.checkout', root).addEventListener('click', () => showToast('Checkout is unavailable in this frontend preview. This is a frontend internship project and not a live store.'));
}

function setFormStatus(form, message, type = '') {
  const status = $('.form-status', form);
  status.textContent = message;
  status.className = `form-status ${type}`;
}
function renderAuth() {
  const signupForm = $('#signup-form');
  const loginForm = $('#login-form');
  if (getSession() && (signupForm || loginForm)) {
    window.location.replace('index.html');
    return;
  }
  signupForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = new FormData(signupForm);
    const name = String(fields.get('name')).trim();
    const email = String(fields.get('email')).trim().toLowerCase();
    const password = String(fields.get('password'));
    const confirmPassword = String(fields.get('confirmPassword'));
    if (name.length < 2) return setFormStatus(signupForm, 'Please enter your full name.', 'is-error');
    if (password.length < 6) return setFormStatus(signupForm, 'Your password needs at least 6 characters.', 'is-error');
    if (password !== confirmPassword) return setFormStatus(signupForm, 'Your passwords do not match.', 'is-error');
    if (getUsers().some((user) => user.email === email)) return setFormStatus(signupForm, 'An account already exists for this email. Try logging in.', 'is-error');
    try {
      const salt = createSalt();
      const passwordHash = await hashPassword(password, salt);
      const user = { name, email, salt, passwordHash, createdAt: new Date().toISOString() };
      localStorage.setItem(USERS_KEY, JSON.stringify([...getUsers(), user]));
      setSession(user);
      setFormStatus(signupForm, 'Account created. Taking you to the collection…', 'is-success');
      window.setTimeout(() => { window.location.href = 'shop.html'; }, 650);
    } catch {
      setFormStatus(signupForm, 'Your browser could not create a local account. Please try again.', 'is-error');
    }
  });
  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = new FormData(loginForm);
    const email = String(fields.get('email')).trim().toLowerCase();
    const password = String(fields.get('password'));
    const user = getUsers().find((item) => item.email === email);
    if (!user) return setFormStatus(loginForm, 'We could not find an account with that email.', 'is-error');
    try {
      const passwordHash = await hashPassword(password, user.salt);
      if (passwordHash !== user.passwordHash) return setFormStatus(loginForm, 'That password does not match this account.', 'is-error');
      setSession(user);
      setFormStatus(loginForm, 'You’re in. Taking you back to the collection…', 'is-success');
      window.setTimeout(() => { window.location.href = 'shop.html'; }, 500);
    } catch {
      setFormStatus(loginForm, 'Your browser could not verify this account. Please try again.', 'is-error');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => { renderHeader(); renderFooter(); renderHome(); renderShop(); renderProduct(); renderCart(); renderAuth(); });
