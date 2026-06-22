/**
 * core.js
 * Loaded on every page. Handles: dark mode, nav, security, footer, profile load.
 */

/* ---- Dark Mode ---- */
const Theme = (() => {
  const KEY = 'ec-theme';
  const root = document.documentElement;

  function get() {
    const stored = localStorage.getItem(KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function set(mode) {
    root.setAttribute('data-theme', mode);
    localStorage.setItem(KEY, mode);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = mode === 'dark' ? '☀︎' : '☾';
  }

  function toggle() {
    set(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }

  return { init: () => set(get()), toggle };
})();

/* ---- Navigation ---- */
function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.getElementById('nav-hamburger');

  // Mark active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });

  // Mobile toggle
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('nav--open');
      hamburger.setAttribute('aria-expanded', nav.classList.contains('nav--open'));
    });
  }
}

/* ---- Security ---- */
function initSecurity() {
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey) {
      if (['s', 'u', 'p'].includes(e.key.toLowerCase())) e.preventDefault();
    }
    if (e.key === 'F12') e.preventDefault();
  });
  document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
}

/* ---- Load JSON helper ---- */
async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

/* ---- Footer ---- */
async function initFooter() {
  try {
    const cfg = await loadJSON('data/site-config.json');
    const el = document.getElementById('footer-copyright');
    if (el) el.textContent = cfg.copyright;
  } catch {}
}

/* ---- Profile (nav brand + social icons) ---- */
async function initProfile() {
  try {
    const profile = await loadJSON('data/profile.json');

    // Social icon links
    const socialMap = {
      'nav-scholar':     profile.social.googleScholar,
      'nav-researchgate': profile.social.researchGate,
      'nav-linkedin':    profile.social.linkedin,
      'nav-orcid':       profile.social.orcid,
      'nav-github':      profile.social.github,
    };
    Object.entries(socialMap).forEach(([id, url]) => {
      const el = document.getElementById(id);
      if (el && url) {
        el.href = url;
        el.style.display = '';
      } else if (el && !url) {
        el.style.display = 'none';
      }
    });
  } catch {}
}

/* ---- Boot ---- */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  initNav();
  initSecurity();
  initFooter();
  initProfile();

  document.getElementById('theme-toggle')?.addEventListener('click', Theme.toggle);
});
