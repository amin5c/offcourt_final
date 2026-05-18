// =============================================
// nav.js — Navigation & Mobile Menu
// =============================================
// This file handles:
//   - Highlighting the active page link
//   - Opening/closing the mobile hamburger menu
//   - Shrinking the nav on scroll
// =============================================

document.addEventListener('DOMContentLoaded', function() {

  // ── HIGHLIGHT the current page link ────────
  // We look at the URL and add the "active" class
  // to the matching nav link so it glows white
  var page = document.body.getAttribute('data-page');
  var map  = { home: 'nl-home', shop: 'nl-shop', sale: 'nl-sale', about: 'nl-about', contact: 'nl-contact' };
  if (map[page]) {
    var el = document.getElementById(map[page]);
    if (el) el.classList.add('active');
  }

  // ── SHRINK nav slightly on scroll ──────────
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function() {
    if (nav) nav.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.4)' : '';
  });

});

// ── MOBILE MENU toggle ────────────────────────
function toggleMob() {
  var menu = document.getElementById('mob-menu');
  var ham  = document.getElementById('ham');
  if (menu) menu.classList.toggle('open');
  if (ham)  ham.classList.toggle('open');
}

function closeMob() {
  var menu = document.getElementById('mob-menu');
  var ham  = document.getElementById('ham');
  if (menu) menu.classList.remove('open');
  if (ham)  ham.classList.remove('open');
}

