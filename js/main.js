/* =============================================================
   Lumos Academy — Main JavaScript
   lumosacademyus.org · April 2026

   Loads localized content from /content/<lang>.json and delegates
   rendering to js/render.js. Event handlers (mobile menu, FAQ,
   form submission) remain here and are attached globally so the
   renderer can reference them by name.
   ============================================================= */

/* ── CONFIG ────────────────────────────────────────────── */
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz3LbwI8ws_lBLehumLx2dw0wfeHBNiUGXbU6ad58SP96E_1-pQ0mSCNyyA0cZGn5ODlw/exec";

const SUPPORTED_LANGS = ['en', 'es'];
const DEFAULT_LANG    = 'en';
const LANG_STORAGE_KEY = 'lac.lang';

// Cached current content — populated after render so form
// handlers can surface localized error messages.
let CURRENT_CONTENT = null;

/* ── LANGUAGE ──────────────────────────────────────────── */

function resolveLang() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('lang');
  if (fromUrl && SUPPORTED_LANGS.indexOf(fromUrl) !== -1) return fromUrl;

  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.indexOf(stored) !== -1) return stored;

  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGS.indexOf(browser) !== -1) return browser;

  return DEFAULT_LANG;
}

function setLanguage(code) {
  if (SUPPORTED_LANGS.indexOf(code) === -1) return;
  localStorage.setItem(LANG_STORAGE_KEY, code);

  const url = new URL(window.location.href);
  url.searchParams.set('lang', code);
  window.history.replaceState({}, '', url);

  loadAndRender(code);
}

async function loadAndRender(lang) {
  try {
    const res = await fetch('content/' + lang + '.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const content = await res.json();
    CURRENT_CONTENT = content;
    window.LAC.render(content);
  } catch (err) {
    console.error('[LAC] Failed to load content for', lang, err);
    if (lang !== DEFAULT_LANG) loadAndRender(DEFAULT_LANG);
  }
}

/* ── MOBILE NAVIGATION ─────────────────────────────────── */
function toggleMenu() {
  const m = document.getElementById('mobMenu');
  if (m) m.classList.toggle('open');
}

function closeMenu() {
  const m = document.getElementById('mobMenu');
  if (m) m.classList.remove('open');
}

document.addEventListener('click', function (e) {
  const menu = document.getElementById('mobMenu');
  const ham = document.getElementById('ham');
  if (menu && menu.classList.contains('open') &&
    !menu.contains(e.target) && ham && !ham.contains(e.target)) {
    menu.classList.remove('open');
  }
});

/* ── SMOOTH SCROLL — delegated because links are rendered late ── */
document.addEventListener('click', function (e) {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (href === '#' || href.length < 2) return;
  const target = document.querySelector(href);
  if (!target) return;
  e.preventDefault();
  window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
});

/* ── FAQ ACCORDION ─────────────────────────────────────── */
function toggleFaq(el) {
  const answer = el.nextElementSibling;
  const wasOpen = el.classList.contains('open');

  document.querySelectorAll('.faq-q').forEach(function (q) { q.classList.remove('open'); });
  document.querySelectorAll('.faq-a').forEach(function (a) { a.classList.remove('open'); });

  if (!wasOpen) {
    el.classList.add('open');
    answer.classList.add('open');
  }
}

/* ── FORM UTILITIES ────────────────────────────────────── */

function setSubmitting(btn, isSubmitting) {
  btn.disabled = isSubmitting;
  const submittingLabel =
    (CURRENT_CONTENT && CURRENT_CONTENT.errors && CURRENT_CONTENT.errors.submitting) || 'Sending…';
  btn.textContent = isSubmitting ? submittingLabel : btn.dataset.original;
}

function showSuccess(formId, successId) {
  document.getElementById(formId).style.display = 'none';
  document.getElementById(successId).style.display = 'block';
}

function showError(btn, message) {
  btn.disabled = false;
  btn.textContent = btn.dataset.original;

  const errId = btn.closest('form').id + 'Error';
  let errEl = document.getElementById(errId);
  if (!errEl) {
    errEl = document.createElement('p');
    errEl.id = errId;
    errEl.style.cssText =
      'color:#c0392b; font-size:.85rem; margin-top:10px; text-align:center;';
    btn.insertAdjacentElement('afterend', errEl);
  }
  errEl.textContent = message;
}

async function postToSheets(payload, btn, formId, successId) {
  if (!btn.dataset.original) btn.dataset.original = btn.textContent;
  setSubmitting(btn, true);

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    showSuccess(formId, successId);
  } catch (err) {
    console.error('[LAC] Form submission error:', err);
    const fallback = 'Something went wrong — please email us at hello@lumosacademyus.org';
    const msg = (CURRENT_CONTENT && CURRENT_CONTENT.errors && CURRENT_CONTENT.errors.formError) || fallback;
    showError(btn, msg);
  }
}

/* ── FORM HANDLERS ─────────────────────────────────────── */

function submitEnrollment(e) {
  e.preventDefault();
  const f = e.target;
  const btn = f.querySelector('button[type="submit"]');

  const payload = {
    formType: 'enrollment',
    parentName: f.querySelector('input[type="text"]').value,
    email: f.querySelector('input[type="email"]').value,
    phone: f.querySelector('input[type="tel"]').value,
    city: f.querySelectorAll('select')[0].value,
    childAge: f.querySelectorAll('select')[1].value,
    program: f.querySelectorAll('select')[2].value,
    courses: f.querySelectorAll('input[type="text"]')[1].value,
    notes: f.querySelector('textarea').value,
  };

  postToSheets(payload, btn, 'enrollForm', 'enrollSuccess');
}

function submitWaitlist(e) {
  e.preventDefault();
  const f = e.target;
  const btn = f.querySelector('button[type="submit"]');

  const payload = {
    formType: 'waitlist',
    parentName: f.querySelector('input[type="text"]').value,
    email: f.querySelector('input[type="email"]').value,
    phone: f.querySelector('input[type="tel"]').value,
    childAge: f.querySelectorAll('select')[0].value,
    weeks: f.querySelectorAll('select')[1].value,
    source: f.querySelectorAll('select')[2].value,
    comments: f.querySelector('textarea').value,
  };

  postToSheets(payload, btn, 'waitlistForm', 'waitlistSuccess');
}

function submitContact(e) {
  e.preventDefault();
  const f = e.target;
  const btn = f.querySelector('button[type="submit"]');
  const inputs = f.querySelectorAll('input[type="text"], input[type="email"]');

  const payload = {
    formType: 'contact',
    name: inputs[0].value,
    email: inputs[1].value,
    subject: f.querySelector('select').value,
    message: f.querySelector('textarea').value,
  };

  postToSheets(payload, btn, 'contactForm', 'contactSuccess');
}

/* ── Expose handlers referenced by rendered markup ───── */
window.toggleMenu       = toggleMenu;
window.closeMenu        = closeMenu;
window.toggleFaq        = toggleFaq;
window.submitEnrollment = submitEnrollment;
window.submitWaitlist   = submitWaitlist;
window.submitContact    = submitContact;
window.setLanguage      = setLanguage;

/* ── BOOTSTRAP ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  loadAndRender(resolveLang());
});
