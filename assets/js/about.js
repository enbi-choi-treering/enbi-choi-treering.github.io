/**
 * about.js
 * Renders: gallery, biography, research interests, awards.
 */

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

/* ---- Gallery ---- */
async function renderGallery() {
  const { images } = await loadJSON('data/gallery.json');
  const grid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  if (!grid) return;

  grid.innerHTML = images.map((img, i) => `
    <div class="gallery-item" data-index="${i}" tabindex="0" role="button" aria-label="${img.caption}">
      <img src="${img.src}" alt="${img.alt}" loading="lazy">
      <div class="gallery-item__caption">${img.caption}</div>
    </div>
  `).join('');

  function openLightbox(index) {
    const img = images[index];
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = img.caption;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  grid.querySelectorAll('.gallery-item').forEach(el => {
    el.addEventListener('click', () => openLightbox(+el.dataset.index));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openLightbox(+el.dataset.index);
    });
  });

  document.getElementById('lightbox-close')?.addEventListener('click', () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  });

  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ---- Biography ---- */
async function renderBiography() {
  const bio = await loadJSON('data/biography.json');
  const el = document.getElementById('biography-content');
  if (!el) return;
  document.getElementById('bio-greeting').textContent = bio.greeting;
  document.getElementById('bio-subgreeting').textContent = bio.subgreeting;
  el.innerHTML = bio.paragraphs.map(p => `<p>${p}</p>`).join('');
}

/* ---- Interests ---- */
async function renderInterests() {
  const { interests } = await loadJSON('data/interests.json');
  const grid = document.getElementById('interests-grid');
  if (!grid) return;
  grid.innerHTML = interests.map(i => `
    <div class="interest-card">
      <div class="interest-card__icon">${i.icon}</div>
      <div class="interest-card__title">${i.title}</div>
      <div class="interest-card__desc">${i.description}</div>
    </div>
  `).join('');
}

/* ---- Funding and Awards (awards + grants, newest first) ---- */
async function renderFundingAndAwards() {
  const container = document.getElementById('awards-list');
  if (!container) return;

  const [awardsRes, grantsRes] = await Promise.allSettled([
    loadJSON('data/awards.json'),
    loadJSON('data/grants.json'),
  ]);

  const awards = awardsRes.status === 'fulfilled' ? (awardsRes.value.awards || []) : [];
  const grants = grantsRes.status === 'fulfilled' ? (grantsRes.value.grants || []) : [];

  const merged = [
    ...awards.map(a => ({ ...a, _type: 'award' })),
    ...grants.map(g => ({ ...g, _type: 'grant' })),
  ].sort((a, b) => (b.year || 0) - (a.year || 0));

  if (!merged.length) {
    container.innerHTML = '<p style="color:var(--color-text-muted);font-size:var(--font-size-sm)">No entries yet.</p>';
    return;
  }

  container.innerHTML = merged.map(item => {
    const dateStr  = formatDate(item.date || String(item.year || ''));
    const typeBadge = item._type === 'grant'
      ? `<span class="badge badge--grant">Grant</span> `
      : `<span class="badge badge--award">Award</span> `;

    let mainText, subText, extraLine = '';

    if (item._type === 'grant') {
      mainText = item.title;
      const parts = [item.funder, item.role ? `(${item.role})` : ''].filter(Boolean).join(' ');
      subText  = parts + (item.amount ? ` — ${item.amount}` : '');
    } else {
      mainText = item.description;
      subText  = item.organization || '';
      if (item.title) extraLine = `<br><span style="font-size:var(--font-size-sm);color:var(--color-text-muted);font-style:italic">${item.title}</span>`;
    }

    return `<div class="award-row">
      <span class="award-row__year">${dateStr}</span>
      <span>${typeBadge}${mainText}${subText ? ` — <em>${subText}</em>` : ''}${extraLine}</span>
    </div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.allSettled([renderGallery(), renderBiography(), renderInterests(), renderFundingAndAwards()]);
});
