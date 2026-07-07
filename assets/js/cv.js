/**
 * cv.js — Auto-generates CV from JSON / Google Sheets data.
 * Promise.allSettled 사용: 파일 하나가 없어도 나머지 섹션은 정상 렌더링
 */

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

function row(year, html) {
  return `<div class="cv-row">
    <span class="cv-row__year">${year}</span>
    <div class="cv-row__content">${html}</div>
  </div>`;
}

const EMPTY = '<p style="color:var(--color-text-muted);font-size:var(--font-size-sm)">No entries yet.</p>';

async function renderCV() {
  const [eduR, empR, awardsR, grantsR, pubsR, teachR] = await Promise.allSettled([
    loadJSON('data/education.json'),
    loadJSON('data/employment.json'),
    loadJSON('data/awards.json'),
    loadJSON('data/grants.json'),
    loadJSON('data/publications.json'),
    loadJSON('data/teaching.json'),
  ]);

  const ok  = r => r.status === 'fulfilled';
  const edu      = ok(eduR)    ? (eduR.value.education     || []) : [];
  const emp      = ok(empR)    ? (empR.value.employment    || []) : [];
  const awards   = ok(awardsR) ? (awardsR.value.awards     || []) : [];
  const grants   = ok(grantsR) ? (grantsR.value.grants     || []) : [];
  const pubs     = ok(pubsR)   ? (pubsR.value.publications || []) : [];
  const teaching = ok(teachR)  ? (teachR.value.teaching    || []) : [];

  /* Education */
  const eduEl = document.getElementById('cv-education');
  if (eduEl) eduEl.innerHTML = edu.length
    ? [...edu].sort((a,b) => b.year - a.year).map(e =>
        row(formatDate(e.date || String(e.year)),
            `<strong>${e.degree}, ${e.field}</strong>
             <span>${e.institution}, ${e.location}</span>
             ${e.thesis ? `<span>Thesis: ${e.thesis}</span>` : ''}`)).join('')
    : EMPTY;

  /* Employment */
  const empEl = document.getElementById('cv-employment');
  if (empEl) empEl.innerHTML = emp.length
    ? [...emp].sort((a,b) => (b.startYear||0) - (a.startYear||0)).map(e =>
        row(`${formatDate(e.startDate || String(e.startYear))}–${e.endDate ? formatDate(e.endDate) : 'present'}`,
            `<strong>${e.title}</strong>
             <span>${e.institution}${e.department ? `, ${e.department}` : ''}</span>
             <span>${e.location}</span>`)).join('')
    : EMPTY;

  /* Awards */
  const awardsEl = document.getElementById('cv-awards');
  if (awardsEl) awardsEl.innerHTML = awards.length
    ? [...awards].sort((a,b) => b.year - a.year).map(a =>
        row(formatDate(a.date || String(a.year)),
            `<strong>${a.description}</strong>
             <span>${a.organization}</span>
             ${a.title ? `<span style="font-size:var(--font-size-sm);font-style:italic">${a.title}</span>` : ''}`)).join('')
    : EMPTY;

  /* Grants */
  const grantsEl = document.getElementById('cv-grants');
  if (grantsEl) grantsEl.innerHTML = grants.length
    ? [...grants].sort((a,b) => b.year - a.year).map(g =>
        row(formatDate(g.date || String(g.year)),
            `<strong>${g.title}</strong>
             <span>${g.funder} — ${g.role}${g.amount ? ` (${g.amount})` : ''}</span>`)).join('')
    : EMPTY;

  /* Publications */
  const pubsEl = document.getElementById('cv-publications');
  if (pubsEl) {
    const sorted = [...pubs].sort((a,b) => b.year - a.year);
    pubsEl.innerHTML = sorted.length
      ? sorted.map(p => {
          const authors = p.authors.map(a =>
            (a.includes('Choi, E.-B.') || a.includes('Choi, En-Bi'))
              ? `<strong>${a}</strong>` : a
          ).join(', ');
          return row(p.year,
            `${authors} (${p.year}). ${p.title}. <em>${p.journal}</em>`
            + `${p.volume ? `, ${p.volume}` : ''}${p.pages ? `, ${p.pages}` : ''}.`
            + `${p.doi ? ` <a href="https://doi.org/${p.doi}" target="_blank" rel="noopener noreferrer">DOI: ${p.doi}</a>` : ''}`
          );
        }).join('')
      : EMPTY;
  }

  /* Teaching */
  const teachEl = document.getElementById('cv-teaching');
  if (teachEl) teachEl.innerHTML = teaching.length
    ? [...teaching].sort((a,b) => b.year - a.year).map(t =>
        row(formatDate(t.date || String(t.year)),
            `<strong>${t.role}</strong>
             <span>${t.course} — ${t.institution}</span>`)).join('')
    : EMPTY;
}

document.addEventListener('DOMContentLoaded', () => {
  renderCV().catch(e => console.error('cv.js:', e));
});
