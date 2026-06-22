/**
 * publications.js
 * Renders: word cloud, keyword filter, publication archive.
 */

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

const STOP_WORDS = new Set([
  'a','an','the','and','or','of','in','on','at','to','for','with',
  'by','from','as','is','was','are','were','be','been','this','that',
  'it','its','we','our','their','using','based','between','through',
  'during','over','under','into','than','more','also','within','across'
]);

const COLORS = ['#4b2e05','#6b4423','#8b5a2b','#a67c52','#556b2f'];

function formatAuthors(authors) {
  return authors.map(a =>
    (a.includes('Choi, E.-B.') || a.includes('Choi, En-Bi'))
      ? `<span class="author-highlight">${a}</span>`
      : a
  ).join(', ');
}

/* ---- Word Cloud ---- */
function buildWordCloud(publications) {
  const freq = {};
  publications.forEach(pub => {
    const text = [pub.title, pub.abstract || '', ...(pub.keywords || [])].join(' ');
    text.toLowerCase().replace(/[^a-z\s-]/g, '').split(/\s+/).forEach(w => {
      if (w.length > 3 && !STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
  });

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 60);
  const max = sorted[0]?.[1] || 1;
  const min = sorted[sorted.length - 1]?.[1] || 1;

  const cloud = document.getElementById('word-cloud');
  if (!cloud) return;

  cloud.innerHTML = sorted.map(([word, count]) => {
    const size = 0.75 + ((count - min) / (max - min + 1)) * 1.75;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return `<span class="word-cloud__word" style="font-size:${size}rem;color:${color}"
      title="${count} occurrence${count > 1 ? 's' : ''}">${word}</span>`;
  }).join('');
}

/* ---- Archive & Filter ---- */
let activeKeywords = new Set();
let allPublications = [];

function renderArchive() {
  const archive = document.getElementById('pub-archive');
  if (!archive) return;

  const filtered = activeKeywords.size === 0
    ? allPublications
    : allPublications.filter(p =>
        [...activeKeywords].every(kw => (p.keywords || []).includes(kw))
      );

  // Group by year
  const byYear = {};
  filtered.forEach(p => { (byYear[p.year] = byYear[p.year] || []).push(p); });
  const years = Object.keys(byYear).sort((a, b) => b - a);

  archive.innerHTML = years.map(year => {
    const pubs = byYear[year];
    const entries = pubs.map(pub => {
      const authors = formatAuthors(pub.authors);
      const oa = pub.openAccess ? `<span class="badge badge--oa">OA</span>` : '';
      const keywords = (pub.keywords || []).map(k =>
        `<span class="keyword-tag${activeKeywords.has(k) ? ' active' : ''}" data-keyword="${k}">${k}</span>`
      ).join('');
      return `<div class="pub-entry" data-id="${pub.id}">
        <div class="pub-entry__meta">
          <span class="badge">${pub.journal}</span>
          ${oa}
        </div>
        <p class="pub-entry__citation">${authors} (${pub.year}).</p>
        <a href="https://doi.org/${pub.doi}" target="_blank" rel="noopener noreferrer" class="pub-entry__title">${pub.title}</a>
        ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank" rel="noopener noreferrer" class="pub-entry__doi">DOI: ${pub.doi}</a>` : ''}
        <div class="pub-entry__keywords">${keywords}</div>
      </div>`;
    }).join('');
    return `<div class="pub-year-group">
      <h3 class="pub-year-group__heading">${year}</h3>
      ${entries}
    </div>`;
  }).join('') || '<p style="color:var(--color-text-muted)">No publications match the selected filters.</p>';

  // Attach keyword filter handlers
  archive.querySelectorAll('.keyword-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const kw = tag.dataset.keyword;
      if (activeKeywords.has(kw)) activeKeywords.delete(kw);
      else activeKeywords.add(kw);
      updateFilterBar();
      renderArchive();
    });
  });
}

function updateFilterBar() {
  const bar = document.getElementById('filter-bar');
  if (!bar) return;

  bar.innerHTML = '';
  activeKeywords.forEach(kw => {
    const tag = document.createElement('span');
    tag.className = 'keyword-tag active';
    tag.textContent = kw;
    tag.addEventListener('click', () => {
      activeKeywords.delete(kw);
      updateFilterBar();
      renderArchive();
    });
    bar.appendChild(tag);
  });

  if (activeKeywords.size > 0) {
    const clear = document.createElement('button');
    clear.className = 'filter-bar__clear';
    clear.textContent = 'Clear all';
    clear.addEventListener('click', () => {
      activeKeywords.clear();
      updateFilterBar();
      renderArchive();
    });
    bar.appendChild(clear);
  }
}

/* ---- Boot ---- */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { publications } = await loadJSON('data/publications.json');
    allPublications = [...publications].sort((a, b) => b.year - a.year);
    buildWordCloud(allPublications);
    renderArchive();
  } catch (e) {
    console.error('publications.js:', e);
  }
});
