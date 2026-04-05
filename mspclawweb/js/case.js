import { initLangToggle } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  const data = window.CASE_DATA;
  if (!data) return;

  const zhContent = document.getElementById('content-zh');
  const enContent = document.getElementById('content-en');
  if (zhContent && window.marked) {
    zhContent.innerHTML = window.marked.parse(data.zh.content);
  }
  if (enContent && window.marked) {
    enContent.innerHTML = window.marked.parse(data.en.content);
  }

  const catTag = document.querySelector('.case-category-tag');
  if (catTag) {
    const colorMap = {
      'social-media': '#ff6b6b',
      'creative': '#ffd93d',
      'infrastructure': '#6bcb77',
      'productivity': '#4d96ff',
      'research': '#c77dff',
      'finance': '#f4a261',
    };
    const color = colorMap[data.category] || '#888';
    catTag.style.background = color + '22';
    catTag.style.color = color;
  }

  initLangToggle();
});
