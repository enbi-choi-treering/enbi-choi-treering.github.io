/**
 * home.js — Hero · News · Latest Publications
 */

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

function formatAuthors(authors) {
  return authors.map(a =>
    a.includes('Choi, E.-B.') || a.includes('Choi, En-Bi')
      ? `<span class="author-highlight">${a}</span>` : a
  ).join(', ');
}

/* ---- Hero ---- */
async function renderHero() {
  const profile = await loadJSON('data/profile.json');
  const img  = document.getElementById('hero-photo');
  const name = document.getElementById('hero-name');
  const pos  = document.getElementById('hero-position');

  if (name) name.textContent = profile.name;
  if (pos)  pos.textContent  = `${profile.position}, ${profile.affiliation}`;

  if (img) {
    if (profile.profilePhoto) {
      img.alt = profile.name;
      img.onerror = () => {
        // ★ fix: replaceWith() 으로 img 하나만 교체 — 형제 요소(이름, 직위)는 유지
        const placeholder = document.createElement('div');
        placeholder.className = 'hero__photo-placeholder';
        placeholder.textContent = 'Photo';
        img.replaceWith(placeholder);
      };
      img.src = profile.profilePhoto;
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'hero__photo-placeholder';
      placeholder.textContent = 'Photo';
      img.replaceWith(placeholder);
    }
  }
}

/* ---- News ---- */
async function renderNews() {
  const { news } = await loadJSON('data/news.json');
  const list = document.getElementById('news-list');
  if (!list) return;
  const sorted = [...news].sort((a, b) => b.date.localeCompare(a.date));
  list.innerHTML = sorted.map(item => {
    const label   = formatDate(item.date);
    const content = item.link
      ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.content}</a>`
      : item.content;
    return `<li class="news-item">
      <span class="news-item__date">${label}</span>
      <span>${content}</span>
    </li>`;
  }).join('');
}

/* ---- Latest Publications ---- */
async function renderLatestPublications() {
  const { publications } = await loadJSON('data/publications.json');
  const container = document.getElementById('latest-pubs');
  if (!container) return;
  const sorted = [...publications].sort((a, b) => b.year - a.year).slice(0, 3);
  container.innerHTML = sorted.map(pub => {
    const authors  = formatAuthors(pub.authors);
    const keywords = (pub.keywords || []).map(k =>
      `<a href="publications.html?kw=${encodeURIComponent(k.replace(/<[^>]+>/g,''))}"
          class="keyword-tag">${k}</a>`
    ).join('');
    const oa = pub.openAccess ? `<span class="badge badge--oa">Open Access</span>` : '';
    return `<div class="pub-card">
      <div class="pub-card__meta">
        <span class="badge">${pub.journal}</span>
        ${oa}
        <span class="badge">${pub.year}</span>
      </div>
      <p class="pub-card__citation">${authors} (${pub.year}).</p>
      <a href="https://doi.org/${pub.doi}" target="_blank" rel="noopener noreferrer"
         class="pub-card__title">${pub.title}</a>
      <div class="pub-card__keywords">${keywords}</div>
    </div>`;
  }).join('');
}

/* ---- Boot ---- */
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.allSettled([renderHero(), renderNews(), renderLatestPublications()]);
});
