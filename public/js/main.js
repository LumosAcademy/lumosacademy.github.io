/* =============================================================
   Lumos Academy — Main JavaScript
   lumosacademyus.org · Version 1.0 · April 2026
   ============================================================= */

/* ── CONFIG ──────────────────────────────────────────────────
   Replace YOUR_DEPLOYMENT_ID after deploying the Apps Script.
   Instructions: see /scripts/google-apps-script.gs
   ------------------------------------------------------------ */
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz3LbwI8ws_lBLehumLx2dw0wfeHBNiUGXbU6ad58SP96E_1-pQ0mSCNyyA0cZGn5ODlw/exec";

/* ── MOBILE NAVIGATION ───────────────────────────────────── */
function toggleMenu() {
  document.getElementById('mobMenu').classList.toggle('open');
}

function closeMenu() {
  document.getElementById('mobMenu').classList.remove('open');
}

// Close mobile menu when clicking outside of it
document.addEventListener('click', function (e) {
  const menu = document.getElementById('mobMenu');
  const ham = document.getElementById('ham');
  if (menu && menu.classList.contains('open') &&
    !menu.contains(e.target) && !ham.contains(e.target)) {
    menu.classList.remove('open');
  }
});

/* ── SMOOTH SCROLL (offset for sticky nav) ───────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
    }
  });
});

/* ── FAQ ACCORDION ───────────────────────────────────────── */
function toggleFaq(el) {
  const answer = el.nextElementSibling;
  const wasOpen = el.classList.contains('open');

  // Collapse all
  document.querySelectorAll('.faq-q').forEach(function (q) { q.classList.remove('open'); });
  document.querySelectorAll('.faq-a').forEach(function (a) { a.classList.remove('open'); });

  // Expand the clicked item (unless it was already open)
  if (!wasOpen) {
    el.classList.add('open');
    answer.classList.add('open');
  }
}

/* ── FORM UTILITIES ─────────────────────────────────────── */

/** Show/hide button loading state */
function setSubmitting(btn, isSubmitting) {
  btn.disabled = isSubmitting;
  btn.textContent = isSubmitting ? 'Sending…' : btn.dataset.original;
}

/** Replace the form with a success message */
function showSuccess(formId, successId) {
  document.getElementById(formId).style.display = 'none';
  document.getElementById(successId).style.display = 'block';
}

/** Show an inline error below the submit button */
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

/**
 * POST a JSON payload to the Apps Script web app.
 * Google Apps Script requires mode:'no-cors', which returns an opaque
 * response — any completion without a network error is treated as success.
 */
async function postToSheets(payload, btn, formId, successId) {
  // Cache the original button label before first submission
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
    showError(
      btn,
      'Something went wrong — please email us at hello@lumosacademyus.org'
    );
  }
}

/* ── FORM HANDLERS ──────────────────────────────────────── */

/** Fall 2026 Enrollment form */
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

/** Summer 2026 Waitlist form */
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

/** Contact form */
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
