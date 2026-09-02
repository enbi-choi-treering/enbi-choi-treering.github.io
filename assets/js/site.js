(function () {
  const newsList = document.getElementById('news-list');
  if (newsList && Array.isArray(window.SITE_NEWS)) {
    const items = window.SITE_NEWS
      .filter(item => item.date && item.text)
      .sort((a, b) => b.date.localeCompare(a.date));

    let visible = 5;
    const button = document.getElementById('show-more-news');

    function renderNews() {
      newsList.innerHTML = '';
      items.slice(0, visible).forEach(item => {
        const row = document.createElement(item.url && item.url !== '#' ? 'a' : 'div');
        row.className = 'news-row';
        if (row.tagName === 'A') row.href = item.url;

        const category = document.createElement('span');
        category.className = 'news-category';
        category.textContent = item.category;

        const date = document.createElement('span');
        date.className = 'news-date';
        date.textContent = String(item.date).slice(0, 7);

        const text = document.createElement('span');
        text.className = 'news-text';
        text.textContent = item.text;

        row.append(category, date, text);
        newsList.appendChild(row);
      });

      if (button) {
        button.hidden = items.length <= visible;
      }
    }

    if (button) {
      button.addEventListener('click', () => {
        visible += 5;
        renderNews();
      });
    }
    renderNews();
  }

  const filterButtons = document.querySelectorAll('.filter-button');
  if (filterButtons.length) {
    const publications = Array.from(document.querySelectorAll('.publication-item'));
    const count = document.getElementById('paper-count');

    function updateYears() {
      document.querySelectorAll('.pub-year').forEach(section => {
        const visibleItems = Array.from(section.querySelectorAll('.publication-item'))
          .some(item => item.style.display !== 'none');
        section.style.display = visibleItems ? '' : 'none';
      });
    }

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        const filter = button.dataset.filter.toLowerCase();
        let visibleCount = 0;

        publications.forEach(pub => {
          const topics = pub.dataset.topics.split('|');
          const show = filter === 'all' || topics.includes(filter);
          pub.style.display = show ? '' : 'none';
          if (show) visibleCount += 1;
        });

        if (count) count.textContent = visibleCount;
        updateYears();
      });
    });
  }
})();
