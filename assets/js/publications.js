/**
 * publications.js — Research Topics word cloud · keyword filter · publication archive
 */

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

/* ── 강조 키워드: 항상 가장 크게 표시 ──────────────────────────────────────
   시트의 실제 키워드 문자열과 대소문자 무관하게 매칭됩니다.
   키워드를 추가하려면 이 배열에 문자열을 넣으세요.              ─────────── */
const FEATURED_KEYWORDS = [
  'δ18O', 'dating', 'historical building',
  'tree-ring oxygen isotopes', 'climate factors',
];

function isFeatured(word) {
  const plain = word.replace(/<[^>]+>/g, '').toLowerCase().trim();
  return FEATURED_KEYWORDS.some(f => plain === f.toLowerCase() || plain.includes(f.toLowerCase()));
}

/* ── CSS 변수 색상 → 다크모드에서 main.css가 자동으로 밝은 색으로 전환 ── */
const COLORS = ['var(--wc-c1)','var(--wc-c2)','var(--wc-c3)',
                'var(--wc-c4)','var(--wc-c5)','var(--wc-c6)'];

function formatAuthors(authors) {
  return authors.map(a =>
    (a.includes('Choi, E.-B.') || a.includes('Choi, En-Bi'))
      ? `<span class="author-highlight">${a}</span>` : a
  ).join(', ');
}

/* ── 키워드 매칭: title + abstract + keywords 모두 검색 ──────────────────── */
function matchesKeyword(pub, kw) {
  const kl = kw.replace(/<[^>]+>/g, '').toLowerCase();
  return (pub.keywords || []).some(k => k.replace(/<[^>]+>/g,'').toLowerCase() === kl)
    || (pub.title    || '').replace(/<[^>]+>/g,'').toLowerCase().includes(kl)
    || (pub.abstract || '').replace(/<[^>]+>/g,'').toLowerCase().includes(kl);
}

/* ── Word Cloud ─────────────────────────────────────────────────────────── */
function buildWordCloud(publications) {
  const cloud = document.getElementById('word-cloud');
  if (!cloud) return;

  const freq = {};
  publications.forEach(pub => {
    (pub.keywords || []).forEach(kw => {
      const k = kw.trim();
      if (k) freq[k] = (freq[k] || 0) + 1;
    });
  });

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 55);
  if (!sorted.length) { cloud.style.display = 'none'; return; }

  const nonFeatured = sorted.filter(([w]) => !isFeatured(w));
  const maxNF  = nonFeatured[0]?.[1] || 1;
  const minNF  = nonFeatured[nonFeatured.length - 1]?.[1] || 1;
  const rangeNF = maxNF - minNF || 1;

  // Shuffle for visual variety
  const display = [...sorted];
  for (let i = display.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [display[i], display[j]] = [display[j], display[i]];
  }

  cloud.innerHTML = display.map(([word, count]) => {
    let size;
    if (isFeatured(word)) {
      size = (2.0 + Math.random() * 0.2).toFixed(2);   // 2.0 – 2.2 rem (항상 최대)
    } else {
      const base = 0.78 + ((count - minNF) / rangeNF) * 0.77;  // 0.78 – 1.55 rem
      size = Math.min(base, 1.55).toFixed(2);
    }
    const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    const active = activeKeywords.has(word) ? ' active' : '';
    return `<span class="word-cloud__word${active}"
               style="font-size:${size}rem;color:${color}"
               data-keyword="${word}"
               title="${count} paper${count > 1 ? 's' : ''}">${word}</span>`;
  }).join('');

  cloud.querySelectorAll('.word-cloud__word').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const kw = el.dataset.keyword;
      if (activeKeywords.has(kw)) activeKeywords.delete(kw);
      else activeKeywords.add(kw);
      updateFilterBar();
      renderArchive();
      buildWordCloud(allPublications);
    });
  });
}

/* ── Archive & Filter ───────────────────────────────────────────────────── */
let activeKeywords  = new Set();
let allPublications = [];

function renderArchive() {
  const archive = document.getElementById('pub-archive');
  if (!archive) return;

  const filtered = activeKeywords.size === 0
    ? allPublications
    : allPublications.filter(p => [...activeKeywords].every(kw => matchesKeyword(p, kw)));

  const byYear = {};
  filtered.forEach(p => { (byYear[p.year] = byYear[p.year] || []).push(p); });
  const years  = Object.keys(byYear).sort((a, b) => b - a);

  archive.innerHTML = years.map(year => {
    const entries = byYear[year].map(pub => {
      const authors  = formatAuthors(pub.authors);
      const oa       = pub.openAccess ? `<span class="badge badge--oa">Open Access</span>` : '';
      const lang     = pub.language   ? `<span class="badge badge--lang">${pub.language}</span>` : '';
      const keywords = (pub.keywords || []).map(k =>
        `<span class="keyword-tag${activeKeywords.has(k) ? ' active' : ''}"
               data-keyword="${k}">${k}</span>`
      ).join('');
      return `<div class="pub-entry" data-id="${pub.id}">
        <div class="pub-entry__meta">
          <span class="badge">${pub.journal}</span>${oa}${lang}
        </div>
        <p class="pub-entry__citation">${authors} (${pub.year}).</p>
        ${pub.doi
          ? `<a href="https://doi.org/${pub.doi}" target="_blank" rel="noopener noreferrer"
                class="pub-entry__title">${pub.title}</a>`
          : `<span class="pub-entry__title">${pub.title}</span>`}
        ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank" rel="noopener noreferrer"
                        class="pub-entry__doi">DOI: ${pub.doi}</a>` : ''}
        <div class="pub-entry__keywords">${keywords}</div>
      </div>`;
    }).join('');
    return `<div class="pub-year-group">
      <h3 class="pub-year-group__heading">${year}</h3>${entries}
    </div>`;
  }).join('') || '<p style="color:var(--color-text-muted)">No publications match the selected filters.</p>';

  archive.querySelectorAll('.keyword-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const kw = tag.dataset.keyword;
      if (activeKeywords.has(kw)) activeKeywords.delete(kw);
      else activeKeywords.add(kw);
      updateFilterBar();
      renderArchive();
      buildWordCloud(allPublications);
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
    tag.textContent = kw.replace(/<[^>]+>/g, '');
    tag.addEventListener('click', () => {
      activeKeywords.delete(kw);
      updateFilterBar(); renderArchive(); buildWordCloud(allPublications);
    });
    bar.appendChild(tag);
  });
  if (activeKeywords.size > 0) {
    const clear = document.createElement('button');
    clear.className = 'filter-bar__clear';
    clear.textContent = 'Clear all';
    clear.addEventListener('click', () => {
      activeKeywords.clear();
      updateFilterBar(); renderArchive(); buildWordCloud(allPublications);
    });
    bar.appendChild(clear);
  }
}

/* ── Boot ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { publications } = await loadJSON('data/publications.json');
    allPublications = [...publications].sort((a, b) => b.year - a.year);

    // URL 파라미터 ?kw= 로 전달된 키워드 자동 활성화
    const initKw = new URLSearchParams(window.location.search).get('kw');
    if (initKw) activeKeywords.add(decodeURIComponent(initKw));

    buildWordCloud(allPublications);
    updateFilterBar();
    renderArchive();

    if (activeKeywords.size > 0) {
      document.getElementById('pub-archive')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (e) { console.error('publications.js:', e); }
});
