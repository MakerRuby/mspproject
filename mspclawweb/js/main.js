import { initLangToggle, getLang, applyLang } from './i18n.js';
import { CASES } from '../data/cases.js';

const filterBtns = document.querySelectorAll('.filter-btn');
const cardsGrid = document.querySelector('.cards-grid');

function getCategoryColor(cat) {
  const map = {
    'social-media': '#ff6b6b',
    'creative': '#ffd93d',
    'infrastructure': '#6bcb77',
    'productivity': '#4d96ff',
    'research': '#c77dff',
    'finance': '#f4a261',
  };
  return map[cat] || '#888';
}

function renderCards(category = 'all') {
  const filtered = category === 'all'
    ? CASES
    : CASES.filter(c => c.category === category);

  cardsGrid.innerHTML = filtered.map(c => `
    <div class="card" data-id="${c.id}" data-category="${c.category}">
      <div class="card-header">
        <span class="category-dot" style="background:${getCategoryColor(c.category)}"></span>
        <div class="card-title">
          <span data-zh>${c.zh.name}</span>
          <span data-en>${c.en.name}</span>
        </div>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-desc">
        <span data-zh>${c.zh.description}</span>
        <span data-en>${c.en.description}</span>
      </div>
      <div class="card-expand">
        <div class="card-expand-inner">
          <div class="expand-detail">
            <span data-zh>${c.zh.expandDetail}</span>
            <span data-en>${c.en.expandDetail}</span>
          </div>
          <div class="skill-tags">
            ${(c.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
          <a href="cases/${c.slug}.html" class="detail-link">
            <span data-zh>查看完整详情 →</span>
            <span data-en>View Full Details →</span>
          </a>
        </div>
      </div>
    </div>
  `).join('');

  // Re-apply current language after re-render
  applyLang(getLang());

  // Attach accordion listeners
  cardsGrid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.detail-link')) return;
      const isExpanded = card.classList.contains('expanded');
      cardsGrid.querySelectorAll('.card.expanded').forEach(c => c.classList.remove('expanded'));
      if (!isExpanded) card.classList.add('expanded');
    });
  });
}

// Filter button listeners
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCards(btn.dataset.category);
  });
});

// Init
renderCards('all');
initLangToggle();
