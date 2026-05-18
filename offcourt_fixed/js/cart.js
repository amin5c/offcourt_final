// =============================================
// cart.js — Shopping Cart
// =============================================
// This file handles:
//   - Adding / removing items
//   - Changing quantities
//   - Opening the cart drawer
//   - The checkout form
//   - Toast pop-up notifications
// =============================================

// Load cart from browser storage, or start empty
var cart = JSON.parse(localStorage.getItem('oc-cart') || '[]');

// ── ADD TO CART ───────────────────────────────
// First checks if the user is logged in (via auth.js)
function addCart(id, e) {
  if (e) e.stopPropagation(); // don't bubble click to parent

  // requireLoginForCart is defined in auth.js
  // It runs the callback only after the user is confirmed logged in
  requireLoginForCart(function() {
    var p  = PRODUCTS.find(function(x) { return x.id === id; });
    if (!p) return;

    var existing = cart.find(function(i) { return i.id === id; });
    if (existing) {
      existing.qty++; // already in cart → just increase qty
    } else {
      cart.push({ id: p.id, name: p.name, brand: p.brand, price: p.price, img: p.img, qty: 1 });
    }
    saveCart();
    showToast('👟 ' + p.name + ' added to cart!');
  });
}

// ── REMOVE FROM CART ─────────────────────────
function delCart(id) {
  cart = cart.filter(function(i) { return i.id !== id; });
  saveCart();
  renderCart();
}

// ── CHANGE QUANTITY ───────────────────────────
// d = +1 or -1
function qChange(id, d) {
  var item = cart.find(function(i) { return i.id === id; });
  if (!item) return;
  item.qty += d;
  if (item.qty <= 0) cart = cart.filter(function(i) { return i.id !== id; });
  saveCart();
  renderCart();
}

// ── SAVE to browser storage and update the badge ──
function saveCart() {
  localStorage.setItem('oc-cart', JSON.stringify(cart));
  updateBadge();
  renderCart();
}

// ── BADGE (the number on the cart button) ─────
function updateBadge() {
  var total = cart.reduce(function(sum, i) { return sum + i.qty; }, 0);
  var badge = document.getElementById('cbadge');
  if (!badge) return;
  badge.textContent = total;
  badge.classList.toggle('on', total > 0);
}

// ── RENDER the cart drawer contents ──────────
function renderCart() {
  var el   = document.getElementById('cdr-items');
  var foot = document.getElementById('cdr-foot');
  if (!el) return;

  if (cart.length === 0) {
    el.innerHTML = '<div class="cdr-empty"><div class="ei">👟</div><div>Your cart is empty</div></div>';
    if (foot) foot.style.display = 'none';
    return;
  }

  // Build one row per cart item
  el.innerHTML = cart.map(function(item) {
    return (
      '<div class="ci">' +
        '<div class="ci-th"><img src="' + item.img + '" alt="' + item.name + '" /></div>' +
        '<div class="ci-info">' +
          '<div class="ci-br">'  + item.brand + '</div>' +
          '<div class="ci-nm">'  + item.name  + '</div>' +
          '<div class="ci-pr">$' + item.price + '</div>' +
          '<div class="qrow">' +
            '<button class="qb" onclick="qChange(\'' + item.id + '\',-1)">−</button>' +
            '<span class="qn">' + item.qty + '</span>' +
            '<button class="qb" onclick="qChange(\'' + item.id + '\',1)">+</button>' +
          '</div>' +
        '</div>' +
        '<button class="ci-del" onclick="delCart(\'' + item.id + '\')">✕ Remove</button>' +
      '</div>'
    );
  }).join('');

  // Totals
  var sub  = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
  var ship = sub >= 200 ? 'Free' : '$15';
  var tot  = sub >= 200 ? sub : sub + 15;

  if (document.getElementById('cdr-sub'))  document.getElementById('cdr-sub').textContent  = '$' + sub;
  if (document.getElementById('cdr-ship')) document.getElementById('cdr-ship').textContent = ship;
  if (document.getElementById('cdr-tot'))  document.getElementById('cdr-tot').textContent  = '$' + tot;
  if (foot) foot.style.display = 'block';
}

// ── OPEN / CLOSE CART DRAWER ─────────────────
function openCart() {
  document.getElementById('cdr')?.classList.add('on');
  document.getElementById('overlay')?.classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cdr')?.classList.remove('on');
  document.getElementById('overlay')?.classList.remove('on');
  document.body.style.overflow = '';
}

// ── OPEN / CLOSE CHECKOUT MODAL ──────────────
function openCheckout() {
  closeCart();
  if (!isLoggedIn()) { openAuth(openCheckout); return; }

  // Pre-fill email from logged-in user
  var user = getCurrentUser();
  var emailField = document.getElementById('o-em');
  if (user && emailField) emailField.value = user.email;

  document.getElementById('mbg')?.classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('mbg')?.classList.remove('on');
  document.body.style.overflow = '';
}

// ── PLACE ORDER ───────────────────────────────
function placeOrder() {
  var fn = document.getElementById('o-fn')?.value.trim();
  var em = document.getElementById('o-em')?.value.trim();
  var ad = document.getElementById('o-ad')?.value.trim();
  var cn = document.getElementById('o-cn')?.value.trim();

  if (!fn || !em || !ad || !cn) {
    showToast('⚠️ Please fill in all fields');
    return;
  }

  // Generate a fake order ID
  var orderId = 'OC-' + Date.now().toString(36).toUpperCase();

  // Show success screen
  document.getElementById('modal-title').textContent = 'Order Placed!';
  document.getElementById('modal-body').innerHTML =
    '<div class="ok-sc">' +
      '<div class="ok-ic">🎉</div>' +
      '<div class="ok-ttl">You\'re all set!</div>' +
      '<div class="ok-id">' + orderId + '</div>' +
      '<div class="ok-msg">Your order is confirmed. We\'ll ship it in 1–2 business days.<br/>Check your email for updates.</div>' +
      '<button class="btn-gold" style="margin-top:24px;padding:13px 32px" onclick="finishOrder()">Done →</button>' +
    '</div>';

  // Clear the cart
  cart = [];
  saveCart();
}

function finishOrder() {
  closeModal();
  // Reset checkout modal back to form for next time
  setTimeout(function() {
    var titleEl = document.getElementById('modal-title');
    var bodyEl  = document.getElementById('modal-body');
    if (titleEl) titleEl.textContent = 'Checkout';
    if (bodyEl) bodyEl.innerHTML =
      '<div class="frow"><div class="fg"><label>First Name</label><input class="fi" id="o-fn" type="text" placeholder="First name" /></div><div class="fg"><label>Last Name</label><input class="fi" id="o-ln" type="text" placeholder="Last name" /></div></div>' +
      '<div class="fg"><label>Email</label><input class="fi" id="o-em" type="email" placeholder="your@email.com" /></div>' +
      '<div class="fg"><label>Address</label><input class="fi" id="o-ad" type="text" placeholder="Street address" /></div>' +
      '<div class="frow"><div class="fg"><label>City</label><input class="fi" id="o-ci" type="text" placeholder="City" /></div><div class="fg"><label>PIN Code</label><input class="fi" id="o-pi" type="text" placeholder="160001" /></div></div>' +
      '<div class="fg" style="margin-top:16px"><label>Card Number</label><input class="fi" id="o-cn" type="text" placeholder="4111 1111 1111 1111" maxlength="19" oninput="fmtCard(this)" /></div>' +
      '<div class="frow"><div class="fg"><label>Expiry</label><input class="fi" id="o-ex" type="text" placeholder="MM / YY" maxlength="7" oninput="fmtExp(this)" /></div><div class="fg"><label>CVV</label><input class="fi" id="o-cv" type="password" placeholder="•••" maxlength="3" /></div></div>' +
      '<button class="btn-gold" style="width:100%;margin-top:8px;padding:14px" onclick="placeOrder()">Place Order →</button>';
  }, 400);
}

// ── CARD NUMBER FORMATTING ────────────────────
// Adds a space every 4 digits: 4111111111111111 → 4111 1111 1111 1111
function fmtCard(el) {
  var v = el.value.replace(/\D/g, '').slice(0, 16);
  el.value = v.match(/.{1,4}/g)?.join(' ') || v;
}

// ── EXPIRY FORMATTING ─────────────────────────
// Formats as MM / YY
function fmtExp(el) {
  var v = el.value.replace(/\D/g, '').slice(0, 4);
  el.value = v.length > 2 ? v.slice(0, 2) + ' / ' + v.slice(2) : v;
}

// ── TOAST NOTIFICATION ────────────────────────
// Shows a small popup at the bottom of the screen for 2.5 seconds
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(t._timer);
  t._timer = setTimeout(function() { t.classList.remove('on'); }, 2500);
}

// ── INIT on page load ─────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  updateBadge();
  renderCart();
});
