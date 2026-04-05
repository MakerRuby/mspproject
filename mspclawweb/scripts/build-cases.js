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

const apiKey = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN;
if (!apiKey) {
  console.error('❌ 请设置 ANTHROPIC_API_KEY 或 ANTHROPIC_AUTH_TOKEN 环境变量');
  process.exit(1);
}

const baseURL = process.env.ANTHROPIC_BASE_URL;
const client = new Anthropic({ apiKey, ...(baseURL ? { baseURL } : {}) });

// ===== Case manifest =====
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

async function fetchMarkdown(slug) {
  const url = `${GITHUB_RAW}/usecases/${slug}.md`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${slug}`);
  return res.text();
}

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

  // Escape content for JSON embedding in HTML
  const safeData = JSON.stringify({
    zh: { name: caseData.zh.name, content: caseData.zh.content },
    en: { name: caseData.en.name, content: caseData.en.content },
    category: caseData.category
  });

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
    <a href="../index.html" class="back-btn">
      ← <span data-zh>返回案例库</span><span data-en>Back to Cases</span>
    </a>
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
        <span data-zh>查看 GitHub 原文</span>
        <span data-en>View on GitHub</span>
        ↗
      </a>
    </footer>
  </main>

  <script>
    window.CASE_DATA = ${safeData};
  <\/script>
  <script type="module" src="../js/case.js"><\/script>
</body>
</html>`;
}

async function build() {
  console.log('🦞 MSP-OpenClaw Use Cases — 开始构建...\n');

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
          name: manifest.enName,
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

      // Extract proper names from first heading
      const zhHeading = zhContent.match(/^#\s+(.+)$/m);
      if (zhHeading) caseData.zh.name = zhHeading[1].trim().slice(0, 40);
      const enHeading = enContent.match(/^#\s+(.+)$/m);
      if (enHeading) caseData.en.name = enHeading[1].trim().slice(0, 60);

      allCases.push(caseData);

      const detailHtml = generateDetailHtml(caseData);
      writeFileSync(join(ROOT, 'cases', `${manifest.slug}.html`), detailHtml, 'utf8');
      console.log(`  ✓ 已生成 cases/${manifest.slug}.html\n`);

      // Brief pause to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));

    } catch (err) {
      console.error(`  ❌ 失败: ${err.message}\n`);
    }
  }

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
