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

/* ---- Brand icons: square badge style ---- */
/*
 * Replaces the complex monochrome SVG paths in the nav with clearly
 * recognisable square-badge icons. Runs on every page via initBrandIcons().
 * CHANGE ONCE HERE → all six pages update automatically.
 */
function initBrandIcons() {
  /* Google Scholar: coloured square + white graduation mortarboard */
  const GS_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="24" height="24" rx="4" stroke="none"/>
    <polygon points="12,3.5 20.5,8 12,12.5 3.5,8" fill="white" stroke="none"/>
    <path fill="white" stroke="none" d="M7.5 11.2L7.5 15.5Q7.5 18.5 12 18.5Q16.5 18.5 16.5 15.5L16.5 11.2L12 13.2Z"/>
    <rect x="19.5" y="8" width="1.5" height="5.2" rx="0.5" fill="white" stroke="none"/>
    <circle cx="20.25" cy="14.5" r="1.5" fill="white" stroke="none"/>
  </svg>`;

  /* ResearchGate: coloured square + bold white "RG" monogram */
  const RG_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="24" height="24" rx="4" stroke="none"/>
    <text x="12" y="17" text-anchor="middle"
          font-family="'Arial Black','Arial',sans-serif"
          font-weight="900" font-size="13" letter-spacing="-0.5"
          fill="white" stroke="none">RG</text>
  </svg>`;

  /* LinkedIn: coloured square + white "in" letterform */
  const LI_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="24" height="24" rx="4" stroke="none"/>
    <path fill="white" stroke="none" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
  </svg>`;

  const gs = document.getElementById('nav-scholar');
  if (gs) gs.innerHTML = GS_SVG;

  const rg = document.getElementById('nav-researchgate');
  if (rg) rg.innerHTML = RG_SVG;

  const li = document.getElementById('nav-linkedin');
  if (li) li.innerHTML = LI_SVG;
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
      'nav-scholar':      profile.social.googleScholar,
      'nav-researchgate': profile.social.researchGate,
      'nav-linkedin':     profile.social.linkedin,
      'nav-orcid':        profile.social.orcid,
      'nav-github':       profile.social.github,
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
  initBrandIcons();   // ← square badge icons
  initSecurity();
  initFooter();
  initProfile();

  document.getElementById('theme-toggle')?.addEventListener('click', Theme.toggle);
});
