/**
 * cv.js
 * Auto-generates CV from JSON data sources.
 */

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

function row(year, html) {
  return `<div class="cv-row">
    <span class="cv-row__year">${year}</span>
    <div class="cv-row__content">${html}</div>
  </div>`;
}

async function renderCV() {
  const [edu, emp, awards, grants, pubs, teaching] = await Promise.all([
    loadJSON('data/education.json'),
    loadJSON('data/employment.json'),
    loadJSON('data/awards.json'),
    loadJSON('data/grants.json'),
    loadJSON('data/publications.json'),
    loadJSON('data/teaching.json'),
  ]);

  /* Education */
  document.getElementById('cv-education').innerHTML =
    [...edu.education].sort((a,b) => b.year - a.year).map(e =>
      row(e.year, `<strong>${e.degree}, ${e.field}</strong>
        <span>${e.institution}, ${e.location}</span>
        ${e.thesis ? `<span>Thesis: ${e.thesis}</span>` : ''}`)
    ).join('');

  /* Employment */
  document.getElementById('cv-employment').innerHTML =
    [...emp.employment].sort((a,b) => b.startYear - a.startYear).map(e =>
      row(`${e.startYear}–${e.endYear || 'present'}`,
        `<strong>${e.title}</strong>
        <span>${e.institution}, ${e.department}</span>
        <span>${e.location}</span>`)
    ).join('');

  /* Awards */
  document.getElementById('cv-awards').innerHTML =
    [...awards.awards].sort((a,b) => b.year - a.year).map(a =>
      row(a.year, `<strong>${a.description}</strong>
        <span>${a.organization}</span>
        ${a.title ? `<span style="font-size:var(--font-size-sm);font-style:italic">${a.title}</span>` : ''}`)
    ).join('');

  /* Grants */
  document.getElementById('cv-grants').innerHTML =
    [...grants.grants].sort((a,b) => b.year - a.year).map(g =>
      row(g.year, `<strong>${g.title}</strong>
        <span>${g.funder} — ${g.role}${g.amount ? ` (${g.amount})` : ''}</span>`)
    ).join('');

  /* Publications */
  const sorted = [...pubs.publications].sort((a,b) => b.year - a.year);
  document.getElementById('cv-publications').innerHTML = sorted.map((p, i) => {
    const authors = p.authors.map(a =>
      (a.includes('Choi, E.-B.') || a.includes('Choi, En-Bi'))
        ? `<u>${a}</u>` : a
    ).join(', ');
    return row(p.year,
      `${authors} (${p.year}). ${p.title}. <em>${p.journal}</em>${p.volume ? `, ${p.volume}` : ''}${p.pages ? `, ${p.pages}` : ''}.
       ${p.doi ? `<a href="https://doi.org/${p.doi}" target="_blank" rel="noopener noreferrer">DOI: ${p.doi}</a>` : ''}`
    );
  }).join('');

  /* Teaching */
  document.getElementById('cv-teaching').innerHTML =
    [...teaching.teaching].sort((a,b) => b.year - a.year).map(t =>
      row(t.year, `<strong>${t.role}</strong>
        <span>${t.course} — ${t.institution}</span>`)
    ).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderCV().catch(e => console.error('cv.js:', e));
});
