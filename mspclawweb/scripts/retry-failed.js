/**
 * retry-failed.js — 仅重新处理 6 个失败案例，追加到 data/cases.js
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GITHUB_RAW = 'https://raw.githubusercontent.com/hesamsheikh/awesome-openclaw-usecases/main';

const apiKey = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN;
if (!apiKey) { console.error('❌ 请设置 API key'); process.exit(1); }
const baseURL = process.env.ANTHROPIC_BASE_URL;
const client = new Anthropic({ apiKey, ...(baseURL ? { baseURL } : {}) });

const FAILED = [
  { slug: 'x-account-analysis', enName: 'X Account Analysis', category: 'social-media' },
  { slug: 'ai-video-editing', enName: 'AI Video Editing via Chat', category: 'creative' },
  { slug: 'earnings-tracker', enName: 'AI Earnings Tracker', category: 'research' },
  { slug: 'latex-paper-writing', enName: 'LaTeX Paper Writing', category: 'research' },
  { slug: 'hf-papers-research-discovery', enName: 'HF Papers Research Discovery', category: 'research' },
  { slug: 'polymarket-autopilot', enName: 'Polymarket Autopilot', category: 'finance' },
];

async function fetchWithRetry(slug, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${GITHUB_RAW}/usecases/${slug}.md`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function translateToZh(enContent, enName) {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{ role: 'user', content: `请将以下 OpenClaw 应用案例的 Markdown 文档翻译成中文。\n\n要求：\n1. 保持 Markdown 格式不变\n2. 代码块内容不翻译\n3. 专有名词保留英文\n4. 翻译自然流畅\n5. 只返回翻译后的 Markdown 内容\n\n案例名称：${enName}\n\n原文：\n${enContent}` }]
  });
  return message.content[0].text;
}

function extractDescription(markdown) {
  const lines = markdown.split('\n').filter(l => l.trim());
  for (const line of lines) {
    if (!line.startsWith('#') && !line.startsWith('|') && !line.startsWith('!') && !line.startsWith('>') && line.length > 20) {
      return line.replace(/[*_`]/g, '').trim().slice(0, 120);
    }
  }
  return '';
}

function extractSkills(markdown) {
  const skills = [];
  const skillMatch = markdown.match(/(?:skills?|插件|技能)[:\s]*([^\n]+)/i);
  if (skillMatch) {
    skillMatch[1].split(/[,，、]/g).forEach(s => {
      const clean = s.replace(/[*_`[\]()]/g, '').trim();
      if (clean && clean.length < 40 && clean.length > 1) skills.push(clean);
    });
  }
  return skills.slice(0, 4);
}

function generateDetailHtml(caseData) {
  const catNameZh = { 'social-media': '社交媒体', 'creative': '创意与构建', 'infrastructure': '基础设施与 DevOps', 'productivity': '生产力工具', 'research': '研究与学习', 'finance': '金融与交易' };
  const catNameEn = { 'social-media': 'Social Media', 'creative': 'Creative & Building', 'infrastructure': 'Infrastructure & DevOps', 'productivity': 'Productivity', 'research': 'Research & Learning', 'finance': 'Finance & Trading' };
  const safeData = JSON.stringify({ zh: { name: caseData.zh.name, content: caseData.zh.content }, en: { name: caseData.en.name, content: caseData.en.content }, category: caseData.category });
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${caseData.zh.name} | MSP-龙虾应用案例</title>
  <meta name="description" content="${caseData.zh.description.replace(/"/g, '&quot;')}" />
  <link rel="stylesheet" href="../css/case.css" />
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
</head>
<body>
  <nav class="case-nav">
    <a href="../index.html" class="back-btn">← <span data-zh>返回案例库</span><span data-en>Back to Cases</span></a>
    <div class="lang-toggle">
      <button class="lang-btn active" data-lang="zh">中文</button>
      <button class="lang-btn" data-lang="en">EN</button>
    </div>
  </nav>
  <main class="case-container">
    <span class="case-category-tag">
      <span data-zh>${catNameZh[caseData.category] || caseData.category}</span>
      <span data-en>${catNameEn[caseData.category] || caseData.category}</span>
    </span>
    <h1 class="case-title-zh">
      <span data-zh>${caseData.zh.name}</span>
      <span data-en>${caseData.en.name}</span>
    </h1>
    <hr class="case-divider" />
    <div id="content-zh" class="case-content" data-zh></div>
    <div id="content-en" class="case-content" data-en></div>
    <footer class="github-footer">
      <a href="${caseData.githubUrl}" target="_blank" rel="noopener" class="github-link">
        <span data-zh>查看 GitHub 原文</span><span data-en>View on GitHub</span> ↗
      </a>
    </footer>
  </main>
  <script>window.CASE_DATA = ${safeData};<\/script>
  <script type="module" src="../js/case.js"><\/script>
</body>
</html>`;
}

async function run() {
  console.log('🔄 重试 6 个失败案例...\n');
  mkdirSync(join(ROOT, 'cases'), { recursive: true });

  // Load existing cases
  const existingPath = join(ROOT, 'data', 'cases.js');
  const existingContent = readFileSync(existingPath, 'utf8');
  const existingMatch = existingContent.match(/export const CASES = (\[[\s\S]*\]);/);
  const existingCases = existingMatch ? JSON.parse(existingMatch[1]) : [];

  const newCases = [];
  for (const manifest of FAILED) {
    console.log(`📄 处理: ${manifest.enName}`);
    try {
      const enContent = await fetchWithRetry(manifest.slug);
      console.log(`  ✓ 已拉取 (${enContent.length} 字符)`);
      const zhContent = await translateToZh(enContent, manifest.enName);
      console.log(`  ✓ 已翻译`);

      const caseData = {
        id: manifest.slug, slug: manifest.slug, category: manifest.category,
        zh: { name: manifest.enName, description: extractDescription(zhContent), expandDetail: extractDescription(zhContent), content: zhContent },
        en: { name: manifest.enName, description: extractDescription(enContent), expandDetail: extractDescription(enContent), content: enContent },
        skills: extractSkills(enContent),
        githubUrl: `https://github.com/hesamsheikh/awesome-openclaw-usecases/blob/main/usecases/${manifest.slug}.md`,
      };
      const zhH = zhContent.match(/^#\s+(.+)$/m); if (zhH) caseData.zh.name = zhH[1].trim().slice(0, 40);
      const enH = enContent.match(/^#\s+(.+)$/m); if (enH) caseData.en.name = enH[1].trim().slice(0, 60);

      newCases.push(caseData);
      writeFileSync(join(ROOT, 'cases', `${manifest.slug}.html`), generateDetailHtml(caseData), 'utf8');
      console.log(`  ✓ 已生成 cases/${manifest.slug}.html\n`);
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`  ❌ 再次失败: ${err.message}\n`);
    }
  }

  // Merge and write
  const allCases = [...existingCases, ...newCases];
  writeFileSync(existingPath, `// Auto-generated — DO NOT EDIT MANUALLY\n// Generated: ${new Date().toISOString()}\n\nexport const CASES = ${JSON.stringify(allCases, null, 2)};\n`, 'utf8');
  console.log(`✅ 合计 ${allCases.length} 个案例已写入 data/cases.js`);
}

run().catch(err => { console.error(err); process.exit(1); });
