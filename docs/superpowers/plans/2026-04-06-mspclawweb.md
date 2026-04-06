# MSP-OpenClaw Use Cases 网站实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建苹果官网风格的中英双语静态网站，展示 42 个 OpenClaw 应用案例，部署到 Vercel。

**Architecture:** 纯静态 HTML+CSS+JS，数据由 Node.js 构建脚本从 GitHub 拉取并经 Claude API 翻译后预生成为 `data/cases.js` 和 42 个 `cases/[slug].html`，首页提供分类筛选和卡片展开交互，所有内容在本地构建完毕后推送 Vercel 托管。

**Tech Stack:** HTML5, CSS3 (CSS Variables, Grid, Flexbox), Vanilla JS (ES6+), Node.js 18+ (构建脚本), @anthropic-ai/sdk, marked.js (markdown 渲染), Vercel (静态托管)

---

## 文件清单

| 路径 | 职责 |
|------|------|
| `mspclawweb/index.html` | 首页：导航 + Hero + 分类筛选 + 卡片网格 |
| `mspclawweb/css/main.css` | 全局苹果风格样式、响应式网格、卡片、动画 |
| `mspclawweb/css/case.css` | 详情页专用样式 |
| `mspclawweb/js/i18n.js` | 语言切换工具（localStorage + data-zh/data-en 控制）|
| `mspclawweb/js/main.js` | 首页逻辑：分类筛选、手风琴展开、语言切换调用 |
| `mspclawweb/js/case.js` | 详情页逻辑：markdown 渲染、语言切换调用 |
| `mspclawweb/data/cases.js` | 42 个案例完整数据（构建脚本生成）|
| `mspclawweb/cases/[slug].html` | 每个案例独立详情页（构建脚本生成，共 42 个）|
| `mspclawweb/vercel.json` | Vercel 静态路由配置 |
| `mspclawweb/scripts/build-cases.js` | 拉取 GitHub → Claude 翻译 → 生成数据和详情页 |
| `mspclawweb/scripts/package.json` | 构建脚本依赖（@anthropic-ai/sdk, node-fetch, marked）|

---

## Task 1: 初始化项目目录结构

**Files:**
- Create: `mspclawweb/css/main.css`
- Create: `mspclawweb/css/case.css`
- Create: `mspclawweb/js/i18n.js`
- Create: `mspclawweb/js/main.js`
- Create: `mspclawweb/js/case.js`
- Create: `mspclawweb/data/.gitkeep`
- Create: `mspclawweb/cases/.gitkeep`
- Create: `mspclawweb/scripts/package.json`
- Create: `mspclawweb/vercel.json`

- [ ] **Step 1: 创建目录结构**

```bash
cd E:/mspproject
mkdir -p mspclawweb/css mspclawweb/js mspclawweb/data mspclawweb/cases mspclawweb/scripts
touch mspclawweb/data/.gitkeep mspclawweb/cases/.gitkeep
```

- [ ] **Step 2: 创建 `mspclawweb/scripts/package.json`**

```json
{
  "name": "mspclawweb-builder",
  "version": "1.0.0",
  "description": "Build script for MSP-OpenClaw Use Cases website",
  "type": "module",
  "scripts": {
    "build": "node build-cases.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "node-fetch": "^3.3.2",
    "marked": "^12.0.0"
  }
}
```

- [ ] **Step 3: 创建 `mspclawweb/vercel.json`**

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

- [ ] **Step 4: 安装构建脚本依赖**

```bash
cd E:/mspproject/mspclawweb/scripts
npm install
```

预期输出：`added N packages`，无报错。

- [ ] **Step 5: 验证目录结构**

```bash
find E:/mspproject/mspclawweb -type f | sort
```

预期：列出 `package.json`、`vercel.json`、`.gitkeep` 等文件。

---

## Task 2: 创建全局 CSS（苹果风格）

**Files:**
- Create: `mspclawweb/css/main.css`

- [ ] **Step 1: 写入 `mspclawweb/css/main.css`**

```css
/* ===== CSS Variables ===== */
:root {
  --bg-primary: #000000;
  --bg-secondary: #1d1d1f;
  --bg-card: #2d2d2f;
  --bg-card-hover: #3a3a3c;
  --text-primary: #f5f5f7;
  --text-secondary: #6e6e73;
  --accent: #2997ff;
  --divider: rgba(255, 255, 255, 0.1);
  --radius-card: 18px;
  --radius-tag: 20px;
  --font-system: -apple-system, BlinkMacSystemFont, "SF Pro Display",
    "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;

  /* Category colors */
  --color-social: #ff6b6b;
  --color-creative: #ffd93d;
  --color-infra: #6bcb77;
  --color-productivity: #4d96ff;
  --color-research: #c77dff;
  --color-finance: #f4a261;
}

/* ===== Reset & Base ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-system);
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

/* ===== Navigation ===== */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 52px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--divider);
}
.nav-logo {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}
.lang-toggle {
  display: flex;
  gap: 2px;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 3px;
}
.lang-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-system);
  transition: background 0.2s, color 0.2s;
}
.lang-btn.active {
  background: var(--accent);
  color: #fff;
}

/* ===== Hero ===== */
.hero {
  text-align: center;
  padding: 80px 24px 60px;
  background: linear-gradient(180deg, #0a0a0a 0%, var(--bg-primary) 100%);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease 0.1s forwards;
}
.hero-title {
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1.1;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #f5f5f7 0%, #a0a0a5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-subtitle {
  font-size: clamp(16px, 2vw, 21px);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  font-weight: 400;
}

/* ===== Category Filter ===== */
.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding: 0 24px 40px;
}
.filter-btn {
  padding: 8px 18px;
  border: 1px solid var(--divider);
  border-radius: var(--radius-tag);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-system);
  transition: all 0.2s ease;
  white-space: nowrap;
}
.filter-btn:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}
.filter-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

/* ===== Card Grid ===== */
.grid-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 80px;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1023px) {
  .cards-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 767px) {
  .cards-grid { grid-template-columns: 1fr; }
  .hero { padding: 60px 20px 40px; }
  .grid-section { padding: 0 16px 60px; }
}

/* ===== Card ===== */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-card);
  border: 1px solid var(--divider);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  background: var(--bg-card-hover);
}
.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 20px 16px;
}
.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  flex: 1;
}
.card-arrow {
  color: var(--text-secondary);
  font-size: 14px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}
.card.expanded .card-arrow {
  transform: rotate(180deg);
}
.card-desc {
  padding: 0 20px 16px 42px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* ===== Card Expand Area ===== */
.card-expand {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
}
.card.expanded .card-expand {
  max-height: 400px;
}
.card-expand-inner {
  padding: 0 20px 20px 20px;
  border-top: 1px solid var(--divider);
}
.expand-detail {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 12px 0 14px;
}
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.skill-tag {
  padding: 3px 10px;
  background: rgba(41,151,255,0.12);
  color: var(--accent);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.detail-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
  transition: opacity 0.2s;
}
.detail-link:hover { opacity: 0.8; text-decoration: none; }

/* ===== Hidden class ===== */
.hidden { display: none !important; }

/* ===== Animations ===== */
@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: 验证 CSS 文件存在**

```bash
ls -la E:/mspproject/mspclawweb/css/
```

预期：列出 `main.css`。

---

## Task 3: 创建详情页 CSS

**Files:**
- Create: `mspclawweb/css/case.css`

- [ ] **Step 1: 写入 `mspclawweb/css/case.css`**

```css
/* ===== Case Detail Page ===== */
:root {
  --bg-primary: #000000;
  --bg-secondary: #1d1d1f;
  --text-primary: #f5f5f7;
  --text-secondary: #6e6e73;
  --accent: #2997ff;
  --divider: rgba(255, 255, 255, 0.1);
  --font-system: -apple-system, BlinkMacSystemFont, "SF Pro Display",
    "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
  --color-social: #ff6b6b;
  --color-creative: #ffd93d;
  --color-infra: #6bcb77;
  --color-productivity: #4d96ff;
  --color-research: #c77dff;
  --color-finance: #f4a261;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--font-system);
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

/* ===== Case Nav ===== */
.case-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 52px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--divider);
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--accent);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.2s;
}
.back-btn:hover { opacity: 0.75; text-decoration: none; }
.lang-toggle {
  display: flex;
  gap: 2px;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 3px;
}
.lang-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-system);
  transition: background 0.2s, color 0.2s;
}
.lang-btn.active { background: var(--accent); color: #fff; }

/* ===== Case Content ===== */
.case-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 60px 24px 100px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s ease 0.05s forwards;
}
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

.case-category-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 20px;
}
.case-title-zh {
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.15;
  margin-bottom: 8px;
}
.case-title-en {
  font-size: clamp(16px, 2.5vw, 22px);
  color: var(--text-secondary);
  font-weight: 400;
  margin-bottom: 40px;
}
.case-divider {
  border: none;
  border-top: 1px solid var(--divider);
  margin-bottom: 40px;
}

/* ===== Markdown Content ===== */
.case-content {
  font-size: 17px;
  line-height: 1.8;
}
.case-content h1,
.case-content h2 { font-size: 24px; font-weight: 600; margin: 32px 0 12px; }
.case-content h3 { font-size: 19px; font-weight: 600; margin: 24px 0 10px; }
.case-content p { margin-bottom: 16px; color: var(--text-primary); }
.case-content ul, .case-content ol {
  margin: 0 0 16px 24px;
  color: var(--text-secondary);
}
.case-content li { margin-bottom: 6px; line-height: 1.6; }
.case-content code {
  background: rgba(255,255,255,0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
  font-family: "SF Mono", "Fira Code", monospace;
  color: #f5f5f7;
}
.case-content pre {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--divider);
  border-radius: 10px;
  padding: 16px 20px;
  overflow-x: auto;
  margin-bottom: 20px;
}
.case-content pre code { background: none; padding: 0; font-size: 13px; }
.case-content blockquote {
  border-left: 3px solid var(--accent);
  padding-left: 16px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}
.case-content a { color: var(--accent); }
.case-content strong { color: var(--text-primary); font-weight: 600; }

/* ===== GitHub Link Footer ===== */
.github-footer {
  margin-top: 60px;
  padding-top: 24px;
  border-top: 1px solid var(--divider);
}
.github-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--accent);
  font-size: 15px;
  font-weight: 500;
  transition: opacity 0.2s;
}
.github-link:hover { opacity: 0.75; text-decoration: none; }

/* ===== Language visibility ===== */
[data-zh], [data-en] { display: block; }
.hidden { display: none !important; }

@media (max-width: 767px) {
  .case-container { padding: 40px 16px 80px; }
}
```

- [ ] **Step 2: 验证**

```bash
ls -la E:/mspproject/mspclawweb/css/
```

预期：列出 `main.css` 和 `case.css`。

---

## Task 4: 创建 i18n.js（语言切换工具）

**Files:**
- Create: `mspclawweb/js/i18n.js`

- [ ] **Step 1: 写入 `mspclawweb/js/i18n.js`**

```js
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
  // Show/hide elements based on lang
  document.querySelectorAll('[data-zh]').forEach(el => {
    el.classList.toggle('hidden', lang === 'en');
  });
  document.querySelectorAll('[data-en]').forEach(el => {
    el.classList.toggle('hidden', lang === 'zh');
  });

  // Update active state on all lang buttons
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
```

---

## Task 5: 创建首页 main.js

**Files:**
- Create: `mspclawweb/js/main.js`

- [ ] **Step 1: 写入 `mspclawweb/js/main.js`**

```js
import { initLangToggle } from './i18n.js';
import { CASES } from '../data/cases.js';

// Category filter
const filterBtns = document.querySelectorAll('.filter-btn');
const cardsGrid = document.querySelector('.cards-grid');

function renderCards(category = 'all') {
  const filtered = category === 'all'
    ? CASES
    : CASES.filter(c => c.category === category);

  cardsGrid.innerHTML = filtered.map(c => `
    <div class="card" data-id="${c.id}" data-category="${c.category}">
      <div class="card-header">
        <span class="category-dot" style="background:${getCategoryColor(c.category)}"></span>
        <div>
          <div class="card-title">
            <span data-zh>${c.zh.name}</span>
            <span data-en class="hidden">${c.en.name}</span>
          </div>
        </div>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-desc">
        <span data-zh>${c.zh.description}</span>
        <span data-en class="hidden">${c.en.description}</span>
      </div>
      <div class="card-expand">
        <div class="card-expand-inner">
          <div class="expand-detail">
            <span data-zh>${c.zh.expandDetail}</span>
            <span data-en class="hidden">${c.en.expandDetail}</span>
          </div>
          <div class="skill-tags">
            ${(c.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
          <a href="cases/${c.slug}.html" class="detail-link">
            <span data-zh>查看完整详情 →</span>
            <span data-en class="hidden">View Full Details →</span>
          </a>
        </div>
      </div>
    </div>
  `).join('');

  // Re-apply current language after re-render
  import('./i18n.js').then(({ getLang, applyLang }) => applyLang(getLang()));

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
```

---

## Task 6: 创建详情页 case.js

**Files:**
- Create: `mspclawweb/js/case.js`

- [ ] **Step 1: 写入 `mspclawweb/js/case.js`**

```js
import { initLangToggle } from './i18n.js';

// case.js runs in the context of a generated cases/[slug].html
// That page inlines the case data as window.CASE_DATA = {...}
// and imports marked from CDN.

document.addEventListener('DOMContentLoaded', () => {
  const data = window.CASE_DATA;
  if (!data) return;

  // Render markdown content
  const zhContent = document.getElementById('content-zh');
  const enContent = document.getElementById('content-en');
  if (zhContent && window.marked) {
    zhContent.innerHTML = window.marked.parse(data.zh.content);
  }
  if (enContent && window.marked) {
    enContent.innerHTML = window.marked.parse(data.en.content);
  }

  // Set category tag color
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
    catTag.style.background = (colorMap[data.category] || '#888') + '22';
    catTag.style.color = colorMap[data.category] || '#888';
  }

  initLangToggle();
});
```

---

## Task 7: 创建首页 index.html

**Files:**
- Create: `mspclawweb/index.html`

- [ ] **Step 1: 写入 `mspclawweb/index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MSP-龙虾应用案例 | MSP-OpenClaw Use Cases</title>
  <meta name="description" content="42 个真实 OpenClaw 应用案例，6 大类别，中英双语展示。" />
  <link rel="stylesheet" href="css/main.css" />
</head>
<body>

  <!-- Navigation -->
  <nav class="nav">
    <span class="nav-logo">
      <span data-zh>MSP-龙虾应用案例</span>
      <span data-en class="hidden">MSP-OpenClaw Use Cases</span>
    </span>
    <div class="lang-toggle">
      <button class="lang-btn active" data-lang="zh">中文</button>
      <button class="lang-btn" data-lang="en">EN</button>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero">
    <h1 class="hero-title">
      <span data-zh>龙虾应用案例库</span>
      <span data-en class="hidden">OpenClaw Use Cases</span>
    </h1>
    <p class="hero-subtitle">
      <span data-zh>42 个真实案例，6 大类别，展示 OpenClaw 如何改变日常工作与生活</span>
      <span data-en class="hidden">42 real-world use cases across 6 categories — discover how OpenClaw transforms everyday work and life</span>
    </p>
  </section>

  <!-- Category Filter -->
  <section class="filter-section">
    <button class="filter-btn active" data-category="all">
      <span data-zh>全部</span><span data-en class="hidden">All</span>
    </button>
    <button class="filter-btn" data-category="social-media">
      <span data-zh>社交媒体</span><span data-en class="hidden">Social Media</span>
    </button>
    <button class="filter-btn" data-category="creative">
      <span data-zh>创意与构建</span><span data-en class="hidden">Creative &amp; Building</span>
    </button>
    <button class="filter-btn" data-category="infrastructure">
      <span data-zh>基础设施 &amp; DevOps</span><span data-en class="hidden">Infrastructure &amp; DevOps</span>
    </button>
    <button class="filter-btn" data-category="productivity">
      <span data-zh>生产力工具</span><span data-en class="hidden">Productivity</span>
    </button>
    <button class="filter-btn" data-category="research">
      <span data-zh>研究与学习</span><span data-en class="hidden">Research &amp; Learning</span>
    </button>
    <button class="filter-btn" data-category="finance">
      <span data-zh>金融与交易</span><span data-en class="hidden">Finance &amp; Trading</span>
    </button>
  </section>

  <!-- Cards Grid -->
  <section class="grid-section">
    <div class="cards-grid"></div>
  </section>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: 在浏览器中打开验证页面结构**

```bash
# Windows: 直接双击打开，或
start E:/mspproject/mspclawweb/index.html
```

预期：页面加载，显示导航栏和 Hero 区（卡片网格为空，因为 data/cases.js 尚未生成）。

---

## Task 8: 创建构建脚本 build-cases.js

**Files:**
- Create: `mspclawweb/scripts/build-cases.js`

- [ ] **Step 1: 写入 `mspclawweb/scripts/build-cases.js`**

```js
/**
 * build-cases.js
 * 
 * 从 GitHub 拉取 42 个案例 markdown，用 Claude API 翻译，
 * 生成 data/cases.js 和 cases/[slug].html
 * 
 * 使用前设置环境变量：ANTHROPIC_API_KEY=your_key
 * 运行：node build-cases.js（在 scripts/ 目录下）
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GITHUB_RAW = 'https://raw.githubusercontent.com/hesamsheikh/awesome-openclaw-usecases/main';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ===== Case manifest (from README) =====
const CASES_MANIFEST = [
  // Social Media
  { slug: 'daily-reddit-digest', enName: 'Daily Reddit Digest', category: 'social-media' },
  { slug: 'daily-youtube-digest', enName: 'Daily YouTube Digest', category: 'social-media' },
  { slug: 'x-account-analysis', enName: 'X Account Analysis', category: 'social-media' },
  { slug: 'multi-source-tech-news-digest', enName: 'Multi-Source Tech News Digest', category: 'social-media' },
  { slug: 'x-twitter-automation', enName: 'X/Twitter Automation', category: 'social-media' },
  // Creative & Building
  { slug: 'overnight-mini-app-builder', enName: 'Goal-Driven Autonomous Tasks', category: 'creative' },
  { slug: 'youtube-content-pipeline', enName: 'YouTube Content Pipeline', category: 'creative' },
  { slug: 'content-factory', enName: 'Multi-Agent Content Factory', category: 'creative' },
  { slug: 'autonomous-game-dev-pipeline', enName: 'Autonomous Game Dev Pipeline', category: 'creative' },
  { slug: 'podcast-production-pipeline', enName: 'Podcast Production Pipeline', category: 'creative' },
  { slug: 'ai-video-editing', enName: 'AI Video Editing via Chat', category: 'creative' },
  // Infrastructure & DevOps
  { slug: 'n8n-workflow-orchestration', enName: 'n8n Workflow Orchestration', category: 'infrastructure' },
  { slug: 'self-healing-home-server', enName: 'Self-Healing Home Server', category: 'infrastructure' },
  // Productivity
  { slug: 'autonomous-project-management', enName: 'Autonomous Project Management', category: 'productivity' },
  { slug: 'multi-channel-customer-service', enName: 'Multi-Channel AI Customer Service', category: 'productivity' },
  { slug: 'phone-based-personal-assistant', enName: 'Phone-Based Personal Assistant', category: 'productivity' },
  { slug: 'inbox-declutter', enName: 'Inbox De-clutter', category: 'productivity' },
  { slug: 'personal-crm', enName: 'Personal CRM', category: 'productivity' },
  { slug: 'health-symptom-tracker', enName: 'Health & Symptom Tracker', category: 'productivity' },
  { slug: 'multi-channel-assistant', enName: 'Multi-Channel Personal Assistant', category: 'productivity' },
  { slug: 'project-state-management', enName: 'Project State Management', category: 'productivity' },
  { slug: 'dynamic-dashboard', enName: 'Dynamic Dashboard', category: 'productivity' },
  { slug: 'todoist-task-manager', enName: 'Todoist Task Manager', category: 'productivity' },
  { slug: 'family-calendar-household-assistant', enName: 'Family Calendar & Household Assistant', category: 'productivity' },
  { slug: 'multi-agent-team', enName: 'Multi-Agent Specialized Team', category: 'productivity' },
  { slug: 'aionui-cowork-desktop', enName: 'OpenClaw as Desktop Cowork', category: 'productivity' },
  { slug: 'custom-morning-brief', enName: 'Custom Morning Brief', category: 'productivity' },
  { slug: 'meeting-notes-action-items', enName: 'Automated Meeting Notes & Action Items', category: 'productivity' },
  { slug: 'habit-tracker-accountability-coach', enName: 'Habit Tracker & Accountability Coach', category: 'productivity' },
  { slug: 'second-brain', enName: 'Second Brain', category: 'productivity' },
  { slug: 'event-guest-confirmation', enName: 'Event Guest Confirmation', category: 'productivity' },
  { slug: 'phone-call-notifications', enName: 'Phone Call Notifications', category: 'productivity' },
  { slug: 'local-crm-framework', enName: 'Local CRM Framework', category: 'productivity' },
  // Research & Learning
  { slug: 'earnings-tracker', enName: 'AI Earnings Tracker', category: 'research' },
  { slug: 'knowledge-base-rag', enName: 'Personal Knowledge Base (RAG)', category: 'research' },
  { slug: 'market-research-product-factory', enName: 'Market Research & Product Factory', category: 'research' },
  { slug: 'pre-build-idea-validator', enName: 'Pre-Build Idea Validator', category: 'research' },
  { slug: 'semantic-memory-search', enName: 'Semantic Memory Search', category: 'research' },
  { slug: 'arxiv-paper-reader', enName: 'arXiv Paper Reader', category: 'research' },
  { slug: 'latex-paper-writing', enName: 'LaTeX Paper Writing', category: 'research' },
  { slug: 'hf-papers-research-discovery', enName: 'HF Papers Research Discovery', category: 'research' },
  // Finance & Trading
  { slug: 'polymarket-autopilot', enName: 'Polymarket Autopilot', category: 'finance' },
];

// ===== Fetch markdown from GitHub =====
async function fetchMarkdown(slug) {
  const url = `${GITHUB_RAW}/usecases/${slug}.md`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${slug}: ${res.status}`);
  return res.text();
}

// ===== Translate with Claude =====
async function translateToZh(enContent, enName) {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `请将以下 OpenClaw 应用案例的 Markdown 文档翻译成中文。

要求：
1. 保持 Markdown 格式不变（标题、列表、代码块等）
2. 代码块内容不翻译
3. 专有名词保留英文（如 OpenClaw、Telegram、Discord、GitHub 等）
4. 翻译要自然流畅，符合中文表达习惯
5. 只返回翻译后的 Markdown 内容，不要加任何解释

案例名称：${enName}

原文：
${enContent}`
    }]
  });
  return message.content[0].text;
}

// ===== Extract short description from markdown =====
function extractDescription(markdown) {
  const lines = markdown.split('\n').filter(l => l.trim());
  // Find first non-heading, non-empty line
  for (const line of lines) {
    if (!line.startsWith('#') && !line.startsWith('|') && !line.startsWith('!') && line.length > 20) {
      return line.replace(/[*_`]/g, '').trim().slice(0, 120);
    }
  }
  return '';
}

// ===== Extract skills from markdown (look for skill-related sections) =====
function extractSkills(markdown) {
  const skills = [];
  const skillMatch = markdown.match(/(?:skills?|插件|技能)[:\s]*([^\n]+)/i);
  if (skillMatch) {
    skillMatch[1].split(/[,，、]/g).forEach(s => {
      const clean = s.replace(/[*_`[\]]/g, '').trim();
      if (clean && clean.length < 40) skills.push(clean);
    });
  }
  return skills.slice(0, 4);
}

// ===== Generate detail page HTML =====
function generateDetailHtml(caseData) {
  const catNameZh = {
    'social-media': '社交媒体',
    'creative': '创意与构建',
    'infrastructure': '基础设施与 DevOps',
    'productivity': '生产力工具',
    'research': '研究与学习',
    'finance': '金融与交易',
  };
  const catNameEn = {
    'social-media': 'Social Media',
    'creative': 'Creative & Building',
    'infrastructure': 'Infrastructure & DevOps',
    'productivity': 'Productivity',
    'research': 'Research & Learning',
    'finance': 'Finance & Trading',
  };

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${caseData.zh.name} | MSP-龙虾应用案例</title>
  <meta name="description" content="${caseData.zh.description}" />
  <link rel="stylesheet" href="../css/case.css" />
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>

  <nav class="case-nav">
    <a href="../index.html" class="back-btn">
      ← <span data-zh>返回案例库</span><span data-en class="hidden">Back to Cases</span>
    </a>
    <div class="lang-toggle">
      <button class="lang-btn active" data-lang="zh">中文</button>
      <button class="lang-btn" data-lang="en">EN</button>
    </div>
  </nav>

  <main class="case-container">
    <span class="case-category-tag">
      <span data-zh>${catNameZh[caseData.category]}</span>
      <span data-en class="hidden">${catNameEn[caseData.category]}</span>
    </span>

    <h1 class="case-title-zh" data-zh>${caseData.zh.name}</h1>
    <p class="case-title-en" data-en class="hidden">${caseData.en.name}</p>
    <p class="case-title-en" data-zh style="display:none">${caseData.en.name}</p>

    <hr class="case-divider" />

    <div id="content-zh" class="case-content" data-zh></div>
    <div id="content-en" class="case-content hidden" data-en></div>

    <footer class="github-footer">
      <a href="${caseData.githubUrl}" target="_blank" rel="noopener" class="github-link">
        <span data-zh>查看 GitHub 原文</span>
        <span data-en class="hidden">View on GitHub</span>
        ↗
      </a>
    </footer>
  </main>

  <script>
    window.CASE_DATA = ${JSON.stringify({ zh: { name: caseData.zh.name, content: caseData.zh.content }, en: { name: caseData.en.name, content: caseData.en.content }, category: caseData.category })};
  </script>
  <script type="module" src="../js/case.js"></script>
</body>
</html>`;
}

// ===== Main build =====
async function build() {
  console.log('🦞 MSP-OpenClaw Use Cases — 开始构建...\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ 请设置 ANTHROPIC_API_KEY 环境变量');
    process.exit(1);
  }

  mkdirSync(join(ROOT, 'data'), { recursive: true });
  mkdirSync(join(ROOT, 'cases'), { recursive: true });

  const allCases = [];

  for (const manifest of CASES_MANIFEST) {
    console.log(`📄 处理: ${manifest.enName}`);
    try {
      const enContent = await fetchMarkdown(manifest.slug);
      console.log(`  ✓ 已拉取 (${enContent.length} 字符)`);

      const zhContent = await translateToZh(enContent, manifest.enName);
      console.log(`  ✓ 已翻译`);

      const caseData = {
        id: manifest.slug,
        slug: manifest.slug,
        category: manifest.category,
        zh: {
          name: extractDescription(zhContent).slice(0, 30) || manifest.enName,
          description: extractDescription(zhContent),
          expandDetail: extractDescription(zhContent),
          content: zhContent,
        },
        en: {
          name: manifest.enName,
          description: extractDescription(enContent),
          expandDetail: extractDescription(enContent),
          content: enContent,
        },
        skills: extractSkills(enContent),
        githubUrl: `https://github.com/hesamsheikh/awesome-openclaw-usecases/blob/main/usecases/${manifest.slug}.md`,
      };

      // Extract proper Chinese name from first heading
      const zhHeading = zhContent.match(/^#\s+(.+)$/m);
      if (zhHeading) caseData.zh.name = zhHeading[1].trim().slice(0, 40);
      const enHeading = enContent.match(/^#\s+(.+)$/m);
      if (enHeading) caseData.en.name = enHeading[1].trim().slice(0, 60) || manifest.enName;

      allCases.push(caseData);

      // Write detail page
      const detailHtml = generateDetailHtml(caseData);
      writeFileSync(join(ROOT, 'cases', `${manifest.slug}.html`), detailHtml, 'utf8');
      console.log(`  ✓ 已生成 cases/${manifest.slug}.html\n`);

      // Rate limit: short pause between API calls
      await new Promise(r => setTimeout(r, 300));

    } catch (err) {
      console.error(`  ❌ 失败: ${err.message}\n`);
    }
  }

  // Write cases.js
  const casesJs = `// Auto-generated by build-cases.js — DO NOT EDIT MANUALLY
// Generated: ${new Date().toISOString()}

export const CASES = ${JSON.stringify(allCases, null, 2)};
`;
  writeFileSync(join(ROOT, 'data', 'cases.js'), casesJs, 'utf8');
  console.log(`\n✅ 完成！生成了 ${allCases.length} 个案例`);
  console.log(`📁 data/cases.js`);
  console.log(`📁 cases/ (${allCases.length} 个 HTML 文件)`);
}

build().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: 验证脚本语法**

```bash
cd E:/mspproject/mspclawweb/scripts
node --input-type=module --eval "import './build-cases.js'" 2>&1 | head -5
```

预期：因缺少 `ANTHROPIC_API_KEY` 输出错误提示 `❌ 请设置 ANTHROPIC_API_KEY 环境变量`，而不是语法错误。

---

## Task 9: 运行构建脚本生成数据

**Files:**
- Generate: `mspclawweb/data/cases.js`
- Generate: `mspclawweb/cases/*.html`（42 个）

- [ ] **Step 1: 设置 API Key 并运行构建脚本**

```bash
cd E:/mspproject/mspclawweb/scripts
export ANTHROPIC_API_KEY="your_actual_api_key_here"
node build-cases.js
```

预期输出（每个案例显示 3 行 ✓ 日志）：
```
🦞 MSP-OpenClaw Use Cases — 开始构建...

📄 处理: Daily Reddit Digest
  ✓ 已拉取 (N 字符)
  ✓ 已翻译
  ✓ 已生成 cases/daily-reddit-digest.html
...
✅ 完成！生成了 42 个案例
```

- [ ] **Step 2: 验证生成结果**

```bash
ls E:/mspproject/mspclawweb/data/
ls E:/mspproject/mspclawweb/cases/ | wc -l
```

预期：`data/` 下有 `cases.js`；`cases/` 下有 42 个 `.html` 文件。

- [ ] **Step 3: 检查 cases.js 数据完整性**

```bash
node -e "
import('./data/cases.js').then(m => {
  console.log('总案例数:', m.CASES.length);
  console.log('示例案例:', JSON.stringify(m.CASES[0], null, 2).slice(0, 400));
});
" 2>/dev/null || node --input-type=module --eval "
import { CASES } from './data/cases.js';
console.log('总案例数:', CASES.length);
console.log('第一个案例名:', CASES[0].zh.name);
"
```

预期：`总案例数: 42`，并显示第一个案例的中文名。

---

## Task 10: 本地验证完整网站

**Files:**（无新文件，验证已有文件）

- [ ] **Step 1: 启动本地 HTTP 服务器**

```bash
cd E:/mspproject/mspclawweb
npx serve . -p 3000
```

或（如果 serve 未安装）：

```bash
cd E:/mspproject/mspclawweb
python -m http.server 3000
```

预期：`Serving at http://localhost:3000`

- [ ] **Step 2: 验证首页**

打开 `http://localhost:3000`：
- [ ] 导航栏显示"MSP-龙虾应用案例"
- [ ] Hero 区渐入动画正常
- [ ] 7 个分类筛选标签显示
- [ ] 42 张案例卡片正确渲染
- [ ] 点击分类标签，卡片正确过滤
- [ ] 点击卡片，展开内容滑出（手风琴，同时只有一个展开）
- [ ] 点击 CN/EN 切换，语言正确切换
- [ ] 刷新后语言偏好保持

- [ ] **Step 3: 验证详情页**

点击任意卡片中的"查看完整详情 →"：
- [ ] 正确跳转到 `cases/[slug].html`
- [ ] 页面渐入动画正常
- [ ] 中英文内容正确渲染（markdown 格式）
- [ ] "返回案例库"按钮可用
- [ ] GitHub 原文链接可用

- [ ] **Step 4: 验证响应式布局**

调整浏览器宽度：
- [ ] ≥1024px：4 列网格
- [ ] 768–1023px：2 列网格
- [ ] <768px：1 列网格

---

## Task 11: 部署到 Vercel

**Files:**（无新文件）

- [ ] **Step 1: 初始化 git 仓库（如未初始化）**

```bash
cd E:/mspproject
git init
git add mspclawweb/
git commit -m "feat: add MSP-OpenClaw Use Cases static website"
```

- [ ] **Step 2: 推送到 GitHub**

```bash
# 先在 GitHub 创建仓库 mspproject，然后：
git remote add origin https://github.com/<your-username>/mspproject.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: 在 Vercel 部署**

1. 登录 [vercel.com](https://vercel.com)
2. 点击 "Add New Project" → 导入 GitHub 仓库
3. **Root Directory** 设置为 `mspclawweb`
4. **Framework Preset** 选择 `Other`
5. **Build Command** 留空（无需构建）
6. **Output Directory** 留空（根目录即输出）
7. 点击 Deploy

- [ ] **Step 4: 验证线上部署**

打开 Vercel 分配的 URL（如 `https://mspclawweb.vercel.app`）：
- [ ] 首页正常加载
- [ ] 案例详情页通过直接 URL 可访问（如 `/cases/daily-reddit-digest`）
- [ ] 语言切换正常
- [ ] 移动端布局正常

---

## 自检清单

覆盖设计规格的所有需求：

| 规格需求 | 对应任务 |
|---------|---------|
| 苹果风格深色主题、配色、字体 | Task 2, 3 |
| 中英双语 CN/EN 切换 + localStorage | Task 4 |
| 响应式 4/2/1 列 | Task 2 |
| 卡片展开/收起（手风琴）+ 动画 | Task 2, 5 |
| 分类筛选 6+全部 = 7 个标签 | Task 7 |
| 案例详情页（独立 HTML）| Task 8 |
| GitHub 拉取 + Claude 翻译 | Task 8 |
| data/cases.js 数据结构 | Task 8, 9 |
| vercel.json 配置 | Task 1 |
| Vercel 部署 | Task 11 |
