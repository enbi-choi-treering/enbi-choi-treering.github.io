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

/* ---- Awards ---- */
async function renderAwards() {
  const { awards } = await loadJSON('data/awards.json');
  const container = document.getElementById('awards-list');
  if (!container) return;
  const sorted = [...awards].sort((a, b) => b.year - a.year);
  container.innerHTML = sorted.map(a => `
    <div class="award-row">
      <span class="award-row__year">${a.year}</span>
      <span>${a.description}${a.organization ? ` — <em>${a.organization}</em>` : ''}</span>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.allSettled([renderGallery(), renderBiography(), renderInterests(), renderAwards()]);
});
