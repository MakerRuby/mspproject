/**
 * i18n.js - Language toggle utility
 * Uses localStorage key 'msp-lang' ('zh' | 'en'), defaults to 'zh'.
 * Elements with data-zh attribute show in Chinese mode.
 * Elements with data-en attribute show in English mode.
 */

export function getLang() {
  return localStorage.getItem('msp-lang') || 'zh';
}

export function setLang(lang) {
  localStorage.setItem('msp-lang', lang);
  applyLang(lang);
}

export function applyLang(lang) {
  document.querySelectorAll('[data-zh]').forEach(el => {
    el.classList.toggle('hidden', lang === 'en');
  });
  document.querySelectorAll('[data-en]').forEach(el => {
    el.classList.toggle('hidden', lang === 'zh');
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

export function initLangToggle() {
  const lang = getLang();
  applyLang(lang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
}
