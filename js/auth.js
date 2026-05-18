// =============================================
// auth.js — Login, Register & Email Verify
// =============================================
// This file handles everything about users:
//   - Storing accounts in the browser (localStorage)
//   - Showing a login/register popup
//   - Email verification with a 6-digit code
//   - Showing the user's name in the nav bar
// =============================================

// ── HELPER: simple password scrambler ────────
// We never save passwords as plain text.
// This turns "myPass1!" into a scrambled string.
function hashPass(str) {
  var h = 5381;
  for (var i = 0; i < str.length; i++) {
    h = Math.imul(h, 33) ^ str.charCodeAt(i);
  }
  return 'h' + Math.abs(h).toString(36) + str.length;
}

// ── READ / WRITE users list from browser storage ──
function getUsers()        { return JSON.parse(localStorage.getItem('oc-users') || '[]'); }
function saveUsers(users)  { localStorage.setItem('oc-users', JSON.stringify(users)); }

// ── SESSION: who is currently logged in? ─────
function getSession()      { return localStorage.getItem('oc-sess') || null; }
function setSession(email) { localStorage.setItem('oc-sess', email); }
function clearSession()    { localStorage.removeItem('oc-sess'); }

// ── Get the full user object for the logged-in person ──
function getCurrentUser() {
  var email = getSession();
  if (!email) return null;
  return getUsers().find(function(u) { return u.email === email; }) || null;
}
function isLoggedIn() { return !!getCurrentUser(); }

// ── REGISTER a new user ───────────────────────
function registerUser(name, email, password) {
  email = email.toLowerCase().trim();
  var users = getUsers();

  if (users.find(function(u) { return u.email === email; }))
    return { ok: false, msg: 'An account with this email already exists.' };
  if (password.length < 8)
    return { ok: false, msg: 'Password needs at least 8 characters.' };
  if (!/[A-Z]/.test(password))
    return { ok: false, msg: 'Password needs at least one capital letter.' };
  if (!/[0-9]/.test(password))
    return { ok: false, msg: 'Password needs at least one number.' };

  // Save user as "not verified yet"
  users.push({ name: name.trim(), email: email, password: hashPass(password), verified: false });
  saveUsers(users);

  // Make a 6-digit code and store it (expires in 15 minutes)
  var code = Math.floor(100000 + Math.random() * 900000).toString();
  var pending = JSON.parse(localStorage.getItem('oc-pending') || '{}');
  pending[email] = { code: code, expires: Date.now() + 15 * 60 * 1000 };
  localStorage.setItem('oc-pending', JSON.stringify(pending));

  return { ok: true, code: code, email: email };
}

// ── VERIFY email with the 6-digit code ───────
function verifyEmail(email, entered) {
  email = email.toLowerCase().trim();
  var pending = JSON.parse(localStorage.getItem('oc-pending') || '{}');
  var rec = pending[email];

  if (!rec)                      return { ok: false, msg: 'No pending code found.' };
  if (Date.now() > rec.expires)  return { ok: false, msg: 'Code expired. Please register again.' };
  if (rec.code !== entered.trim()) return { ok: false, msg: 'Wrong code. Try again.' };

  // Mark user as verified
  var users = getUsers();
  var u = users.find(function(u) { return u.email === email; });
  if (u) { u.verified = true; saveUsers(users); }

  delete pending[email];
  localStorage.setItem('oc-pending', JSON.stringify(pending));
  setSession(email);
  return { ok: true };
}

// ── Resend a fresh code ───────────────────────
function resendCode(email) {
  email = email.toLowerCase().trim();
  var code = Math.floor(100000 + Math.random() * 900000).toString();
  var pending = JSON.parse(localStorage.getItem('oc-pending') || '{}');
  pending[email] = { code: code, expires: Date.now() + 15 * 60 * 1000 };
  localStorage.setItem('oc-pending', JSON.stringify(pending));
  return code;
}

// ── LOGIN ─────────────────────────────────────
function loginUser(email, password) {
  email = email.toLowerCase().trim();
  var u = getUsers().find(function(u) { return u.email === email; });
  if (!u)                             return { ok: false, msg: 'No account found with this email.' };
  if (u.password !== hashPass(password)) return { ok: false, msg: 'Wrong password.' };
  if (!u.verified)                    return { ok: false, msg: 'Email not verified.', needsVerify: true };
  setSession(email);
  return { ok: true, user: u };
}

// ── LOGOUT ────────────────────────────────────
function logoutUser() {
  clearSession();
  var inPages = window.location.pathname.includes('/pages/');
  window.location.href = inPages ? '../index.html' : 'index.html';
}

// ── UPDATE NAV with Login button or user avatar ──
function renderAuthNav() {
  var slot = document.getElementById('nav-auth-slot');
  if (!slot) return;
  var user = getCurrentUser();

  if (user) {
    // Show user initials in a circle + a dropdown
    var initials = user.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
    slot.innerHTML =
      '<div class="user-drop-wrap">' +
        '<div class="nav-avatar" id="nav-av" onclick="toggleUserDrop()">' + initials + '</div>' +
        '<div class="user-drop" id="user-drop">' +
          '<div class="user-drop-name">'  + user.name  + '</div>' +
          '<div class="user-drop-email">' + user.email + '</div>' +
          '<hr class="user-drop-hr" />' +
          '<button class="user-drop-btn" onclick="logoutUser()">Sign Out</button>' +
        '</div>' +
      '</div>';
  } else {
    slot.innerHTML = '<button class="btn-signin" onclick="openAuth()">👤 Sign In</button>';
  }
}

function toggleUserDrop() {
  var d = document.getElementById('user-drop');
  if (d) d.classList.toggle('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  var av = document.getElementById('nav-av');
  var d  = document.getElementById('user-drop');
  if (d && av && !av.contains(e.target) && !d.contains(e.target)) {
    d.classList.remove('open');
  }
});

// ── BUILD THE AUTH POPUP HTML ─────────────────
// This is one popup that handles Login, Register, and Verify
function buildAuthPopup() {
  if (document.getElementById('auth-overlay')) return; // already built

  var html =
    '<div class="auth-overlay" id="auth-overlay">' +
    '<div class="auth-popup">' +
      '<button class="auth-popup-close" onclick="closeAuth()">✕</button>' +
      '<div class="auth-popup-logo">Off<span>Court</span></div>' +

      // TABS: Login | Register
      '<div class="auth-tabs">' +
        '<button class="auth-tab active" id="tab-login"    onclick="switchTab(\'login\')"   >Sign In</button>' +
        '<button class="auth-tab"        id="tab-register" onclick="switchTab(\'register\')">Create Account</button>' +
      '</div>' +

      // ── LOGIN PANEL ──
      '<div id="panel-login">' +
        '<div class="fg"><label>Email</label><input class="fi" id="li-email" type="email" placeholder="your@email.com" /></div>' +
        '<div class="fg"><label>Password</label>' +
          '<div class="pass-wrap"><input class="fi" id="li-pass" type="password" placeholder="••••••••" />' +
          '<button class="pass-eye" onclick="toggleEye(\'li-pass\',this)">👁</button></div>' +
        '</div>' +
        '<div class="auth-err" id="li-err"></div>' +
        '<button class="btn-gold" style="width:100%;padding:13px" onclick="doLogin()">Sign In →</button>' +
      '</div>' +

      // ── REGISTER PANEL ──
      '<div id="panel-register" style="display:none">' +
        '<div class="fg"><label>Full Name</label><input class="fi" id="rg-name" type="text" placeholder="Alex Jordan" /></div>' +
        '<div class="fg"><label>Email</label><input class="fi" id="rg-email" type="email" placeholder="your@email.com" /></div>' +
        '<div class="fg"><label>Password</label>' +
          '<div class="pass-wrap"><input class="fi" id="rg-pass" type="password" placeholder="Min 8 chars, 1 capital, 1 number" oninput="showStrength(this.value)" />' +
          '<button class="pass-eye" onclick="toggleEye(\'rg-pass\',this)">👁</button></div>' +
          '<div class="str-bar"><div class="str-fill" id="str-fill"></div></div>' +
          '<div class="str-lbl"  id="str-lbl"></div>' +
        '</div>' +
        '<div class="fg"><label>Confirm Password</label><input class="fi" id="rg-pass2" type="password" placeholder="••••••••" /></div>' +
        '<div class="auth-err" id="rg-err"></div>' +
        '<button class="btn-gold" style="width:100%;padding:13px" onclick="doRegister()">Create Account →</button>' +
      '</div>' +

      // ── VERIFY PANEL ──
      '<div id="panel-verify" style="display:none">' +
        '<div style="text-align:center;margin-bottom:16px;font-size:36px">📧</div>' +
        '<div style="font-size:15px;font-weight:700;color:var(--white);margin-bottom:6px">Check your email</div>' +
        '<div class="auth-popup-sub" id="verify-sub">Enter the 6-digit code we sent you.</div>' +
        '<div class="code-row" id="code-row">' +
          '<input class="code-box" maxlength="1" type="text" inputmode="numeric" />' +
          '<input class="code-box" maxlength="1" type="text" inputmode="numeric" />' +
          '<input class="code-box" maxlength="1" type="text" inputmode="numeric" />' +
          '<input class="code-box" maxlength="1" type="text" inputmode="numeric" />' +
          '<input class="code-box" maxlength="1" type="text" inputmode="numeric" />' +
          '<input class="code-box" maxlength="1" type="text" inputmode="numeric" />' +
        '</div>' +
        // Show code in demo mode (no real email server)
        '<div class="demo-box" id="demo-box"></div>' +
        '<div class="auth-err" id="vr-err"></div>' +
        '<button class="btn-gold" style="width:100%;padding:13px" onclick="doVerify()">Verify →</button>' +
        '<div class="auth-switch" style="margin-top:10px"><a onclick="doResend()">Resend code</a> · <a onclick="switchTab(\'register\')">Go back</a></div>' +
      '</div>' +

    '</div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
  setupCodeBoxes();
}

// ── CODE BOX: auto-jump to next box when you type a digit ──
function setupCodeBoxes() {
  var boxes = document.querySelectorAll('.code-box');
  boxes.forEach(function(box, i) {
    box.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, ''); // digits only
      if (this.value && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !this.value && i > 0) boxes[i - 1].focus();
    });
    box.addEventListener('paste', function(e) {
      var pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
      boxes.forEach(function(b, j) { b.value = pasted[j] || ''; });
      boxes[Math.min(pasted.length, 5)].focus();
      e.preventDefault();
    });
  });
}

// ── TAB SWITCHER ─────────────────────────────
function switchTab(tab) {
  ['login','register','verify'].forEach(function(t) {
    var panel = document.getElementById('panel-' + t);
    var tabBtn = document.getElementById('tab-' + t);
    if (panel) panel.style.display = (t === tab) ? 'block' : 'none';
    if (tabBtn) tabBtn.classList.toggle('active', t === tab);
  });
  ['li-err','rg-err','vr-err'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

// ── OPEN / CLOSE ─────────────────────────────
var _pendingEmail = '';
var _afterLogin   = null; // run this function after login succeeds

function openAuth(afterLoginCb) {
  buildAuthPopup();
  if (afterLoginCb) _afterLogin = afterLoginCb;
  var ov = document.getElementById('auth-overlay');
  if (ov) {
    ov.classList.add('show');
    document.body.style.overflow = 'hidden';
    switchTab('login');
    setTimeout(function() {
      var f = ov.querySelector('input');
      if (f) f.focus();
    }, 120);
  }
}

function closeAuth() {
  var ov = document.getElementById('auth-overlay');
  if (ov) { ov.classList.remove('show'); document.body.style.overflow = ''; }
  if (_afterLogin && isLoggedIn()) { var cb = _afterLogin; _afterLogin = null; cb(); }
  else { _afterLogin = null; }
}

// Close on backdrop click
document.addEventListener('click', function(e) {
  var ov = document.getElementById('auth-overlay');
  if (ov && e.target === ov) closeAuth();
});

// ── LOGIN handler ─────────────────────────────
function doLogin() {
  var email = document.getElementById('li-email').value;
  var pass  = document.getElementById('li-pass').value;
  var errEl = document.getElementById('li-err');
  if (!email || !pass) { errEl.textContent = 'Please fill in both fields.'; return; }

  var r = loginUser(email, pass);
  if (r.ok) {
    renderAuthNav();
    closeAuth();
    showToast('👋 Welcome back, ' + r.user.name + '!');
  } else if (r.needsVerify) {
    _pendingEmail = email;
    switchTab('verify');
    showDemoCode(resendCode(email));
  } else {
    errEl.textContent = r.msg;
    document.getElementById('li-pass').classList.add('shake');
    setTimeout(function() { document.getElementById('li-pass').classList.remove('shake'); }, 400);
  }
}

// ── REGISTER handler ──────────────────────────
function doRegister() {
  var name  = document.getElementById('rg-name').value;
  var email = document.getElementById('rg-email').value;
  var pass  = document.getElementById('rg-pass').value;
  var pass2 = document.getElementById('rg-pass2').value;
  var errEl = document.getElementById('rg-err');

  if (!name || !email || !pass || !pass2) { errEl.textContent = 'Please fill in all fields.'; return; }
  if (pass !== pass2) { errEl.textContent = 'Passwords do not match.'; return; }

  var r = registerUser(name, email, pass);
  if (r.ok) {
    _pendingEmail = r.email;
    switchTab('verify');
    document.getElementById('verify-sub').textContent = 'We sent a code to ' + r.email;
    showDemoCode(r.code);
  } else {
    errEl.textContent = r.msg;
  }
}

// ── VERIFY handler ────────────────────────────
function doVerify() {
  var boxes = document.querySelectorAll('.code-box');
  var code  = Array.from(boxes).map(function(b) { return b.value; }).join('');
  var errEl = document.getElementById('vr-err');
  if (code.length < 6) { errEl.textContent = 'Please enter all 6 digits.'; return; }

  var r = verifyEmail(_pendingEmail, code);
  if (r.ok) {
    renderAuthNav();
    closeAuth();
    var u = getCurrentUser();
    showToast('🎉 Welcome' + (u ? ', ' + u.name : '') + '! Account verified.');
  } else {
    errEl.textContent = r.msg;
  }
}

function doResend() {
  if (!_pendingEmail) return;
  showDemoCode(resendCode(_pendingEmail));
  document.querySelectorAll('.code-box').forEach(function(b) { b.value = ''; });
  document.querySelectorAll('.code-box')[0].focus();
  showToast('✉️ New code generated!');
}

// Show the verification code in a demo box
// (In a real app this would go to the user's email)
function showDemoCode(code) {
  var el = document.getElementById('demo-box');
  if (el) el.innerHTML = '<span class="demo-lbl">⚡ Demo Mode — Your code:</span> <strong>' + code + '</strong>';
}

// ── PASSWORD VISIBILITY TOGGLE ────────────────
function toggleEye(inputId, btn) {
  var inp = document.getElementById(inputId);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

// ── PASSWORD STRENGTH METER ───────────────────
function showStrength(pass) {
  var fill = document.getElementById('str-fill');
  var lbl  = document.getElementById('str-lbl');
  if (!fill || !lbl) return;
  var score = 0;
  if (pass.length >= 8)           score++;
  if (/[A-Z]/.test(pass))         score++;
  if (/[0-9]/.test(pass))         score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  if (pass.length >= 12)          score++;
  var colors = ['','#e05252','#d07020','#c9a020','#52a052','#208a20'];
  var labels = ['','Very Weak','Weak','Okay','Strong','Very Strong'];
  fill.style.width      = (score / 5 * 100) + '%';
  fill.style.background = colors[score] || '';
  lbl.textContent       = pass ? labels[score] : '';
  lbl.style.color       = colors[score] || '';
}

// ── GATE: require login before adding to cart ──
// This is called from cart.js
function requireLoginForCart(onSuccess) {
  if (isLoggedIn()) {
    onSuccess();
  } else {
    showToast('👆 Please sign in to add to cart');
    openAuth(onSuccess);
  }
}

// ── INIT on every page load ───────────────────
document.addEventListener('DOMContentLoaded', function() {
  buildAuthPopup();
  renderAuthNav();
});
