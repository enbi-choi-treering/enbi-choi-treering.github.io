/**
 * home.js — Hero · News · Research Topics · Latest Publications
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
  if (img) {
    img.src = profile.profilePhoto;
    img.alt = profile.name;
    img.onerror = () => { img.parentElement.innerHTML = `<div class="hero__photo-placeholder">Photo</div>`; };
  }
  if (name) name.textContent = profile.name;
  if (pos)  pos.textContent  = `${profile.position}, ${profile.affiliation}`;
}

/* ---- News ---- */
async function renderNews() {
  const { news } = await loadJSON('data/news.json');
  const list = document.getElementById('news-list');
  if (!list) return;
  const sorted = [...news].sort((a, b) => b.date.localeCompare(a.date));
  list.innerHTML = sorted.map(item => {
    const label   = formatDate(item.date);   // ← 연도-월 형식
    const content = item.link
      ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.content}</a>`
      : item.content;
    return `<li class="news-item">
      <span class="news-item__date">${label}</span>
      <span>${content}</span>
    </li>`;
  }).join('');
}

/* ---- Research Topics (keyword cloud) ---- */
async function renderResearchTopics() {
  const { publications } = await loadJSON('data/publications.json');

  // Build frequency from Keywords column only
  const freq = {};
  publications.forEach(pub => {
    (pub.keywords || []).forEach(kw => {
      const k = kw.trim();
      if (k) freq[k] = (freq[k] || 0) + 1;
    });
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 45);
  if (!sorted.length) return;

  const max = sorted[0][1];
  const min = sorted[sorted.length - 1][1];
  const range = max - min || 1;

  // Inject section before Latest Publications
  const latestSection = document.getElementById('latest-pubs')?.closest('section');
  if (!latestSection) return;

  const section = document.createElement('section');
  section.className = 'section';
  section.innerHTML = `
    <div class="container">
      <h2 class="section__title">Research Topics</h2>
      <div class="topic-cloud">
        ${sorted.map(([kw, count]) => {
          const size = (0.82 + ((count - min) / range) * 1.3).toFixed(2);
          const enc  = encodeURIComponent(kw);
          return `<a href="publications.html?kw=${enc}"
                    class="topic-cloud__tag"
                    style="font-size:${size}rem"
                    title="${count} paper${count > 1 ? 's' : ''}">${kw}</a>`;
        }).join('')}
      </div>
    </div>`;
  latestSection.parentNode.insertBefore(section, latestSection);
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
      `<a href="publications.html?kw=${encodeURIComponent(k)}" class="keyword-tag">${k}</a>`
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
  await Promise.allSettled([
    renderHero(),
    renderNews(),
    renderResearchTopics(),
    renderLatestPublications(),
  ]);
});
