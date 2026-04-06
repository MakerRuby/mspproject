# MSP-龙虾应用案例网站 设计规格

**日期：** 2026-04-06
**项目名称：** MSP-龙虾应用案例 / MSP-OpenClaw Use Cases
**技术栈：** 纯静态 HTML + CSS + JS，部署到 Vercel

---

## 1. 目标

构建一个苹果官网风格的中英文双语静态网站，汇总展示 [awesome-openclaw-usecases](https://github.com/hesamsheikh/awesome-openclaw-usecases) 仓库中 42 个真实 OpenClaw 应用案例，按 6 大类别组织，支持卡片展开/收起交互，每个案例有独立详情页。网站名称：MSP-龙虾应用案例 / MSP-OpenClaw Use Cases。

---

## 2. 目录结构

```
E:/mspproject/mspclawweb/
├── index.html
├── vercel.json
├── css/
│   ├── main.css
│   └── case.css
├── js/
│   ├── main.js
│   ├── case.js
│   └── i18n.js
├── data/
│   └── cases.js
├── cases/
│   └── [slug].html  （共 42 个）
└── scripts/
    └── build-cases.js
```

---

## 3. 数据来源与构建策略

- **来源：** `https://github.com/hesamsheikh/awesome-openclaw-usecases`
- **案例总数：** 42 个
- **翻译方式：** 构建时预翻译（A 方案），使用 Claude API（claude-haiku-4-5）批量翻译所有 markdown 文件
- **构建脚本 `scripts/build-cases.js` 工作流：**
  1. 拉取 README.md，解析 42 个案例 slug 和英文描述
  2. 逐一拉取 `usecases/*.md` 原始内容
  3. 调用 Claude API 翻译为中文
  4. 写入 `data/cases.js`（含中英文完整内容）
  5. 为每个案例生成 `cases/[slug].html`

### cases.js 数据结构

```js
{
  id: "daily-reddit-digest",
  slug: "daily-reddit-digest",
  category: "social-media",
  zh: {
    name: "每日 Reddit 精华",
    description: "根据你的偏好，自动整理并推送你订阅的版块精华内容。",
    content: "...完整中文 markdown 内容..."
  },
  en: {
    name: "Daily Reddit Digest",
    description: "Summarize a curated digest of your favourite subreddits.",
    content: "...原始英文 markdown 内容..."
  },
  githubUrl: "https://github.com/hesamsheikh/awesome-openclaw-usecases/blob/main/usecases/daily-reddit-digest.md"
}
```

---

## 4. 案例分类（6 大类，共 42 个）

| 类别 | 英文 | 数量 | 色标 |
|------|------|------|------|
| 社交媒体 | Social Media | 5 | `#ff6b6b` 红 |
| 创意与构建 | Creative & Building | 6 | `#ffd93d` 黄 |
| 基础设施与 DevOps | Infrastructure & DevOps | 2 | `#6bcb77` 绿 |
| 生产力工具 | Productivity | 20 | `#4d96ff` 蓝 |
| 研究与学习 | Research & Learning | 8 | `#c77dff` 紫 |
| 金融与交易 | Finance & Trading | 1 | `#f4a261` 橙 |

---

## 5. 视觉设计（苹果风格）

### 配色
- 背景：`#000000` / `#1d1d1f`
- 卡片背景：`#2d2d2f`
- 主文字：`#f5f5f7`
- 副文字：`#6e6e73`
- 强调色：`#2997ff`
- 分割线：`rgba(255,255,255,0.1)`

### 字体
- 中文：PingFang SC / Noto Sans SC（系统字体优先）
- 英文：`-apple-system, BlinkMacSystemFont, "SF Pro Display"`
- 标题：40px/32px；正文：17px；副文：14px

### 响应式断点
- 桌面（≥1024px）：4 列网格
- 平板（768px–1023px）：2 列网格
- 手机（<768px）：1 列网格

---

## 6. 首页布局

```
[顶部导航栏]  网站名称（左）  CN/EN 切换（右）
[Hero 区]     大标题 + 副标题，居中，渐入动画
[分类筛选]    7 个胶囊标签：全部 / 社交媒体 / 创意与构建 / 基础设施 / 生产力工具 / 研究与学习 / 金融与交易
[卡片网格]    响应式 4/2/1 列，卡片圆角 18px
  └─ 卡片：类别色标圆点 + 案例名 + 一行描述 + 展开箭头
     展开态：功能说明（2-3行）+ 所需技能标签 + "查看完整详情 →" 按钮
```

---

## 7. 详情页布局

```
[顶部]  ← 返回案例库  |  CN/EN 切换（右）
[标题区]  中文名（大）/ English Name（小）+ 类别标签
[正文]  markdown 渲染，双语段落（语言切换控制显隐）
[底部]  查看 GitHub 原文 ↗
```

---

## 8. 交互规格

### 语言切换
- 顶部 CN/EN 按钮，全局切换
- `data-zh` / `data-en` 属性控制显隐
- 语言偏好存 `localStorage`，刷新后保持

### 卡片交互
- 点击展开：`max-height` 动画，300ms ease
- 手风琴模式：同时只允许一张卡片展开
- 再次点击收起

### 分类筛选
- 点击标签过滤卡片（JS 显示/隐藏）
- 激活标签高亮（`#2997ff` 背景）

### 页面动画
- 首页 Hero：`opacity + translateY` 渐入，400ms
- 详情页进入：`opacity + translateY` 淡入，400ms
- 卡片 hover：`scale(1.02)` + box-shadow 加深，200ms

---

## 9. 部署

- **平台：** Vercel
- **vercel.json：** 配置 `cleanUrls: true`，所有路由指向对应 HTML
- **构建流程（本地运行一次）：**
  1. 本地设置 `ANTHROPIC_API_KEY` 环境变量
  2. 运行 `node scripts/build-cases.js` 生成 `data/cases.js` 和 `cases/*.html`
  3. 将所有生成文件连同源码一起提交到代码仓库
  4. 推送到 GitHub，Vercel 自动部署（无需 API key，纯静态托管）
- **发布目录：** `mspclawweb/`（整个文件夹作为静态站根）
- **注意：** Vercel 不执行任何构建步骤，所有文件均预先生成完毕

---

## 10. 不在范围内

- 后端 / 服务端逻辑
- 用户账号 / 评论系统
- 实时翻译（构建时已完成）
- 搜索功能（超出当前范围）
