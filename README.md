# 全球周期投资模拟器

一个面向二级市场新手投资人的教育型网页模拟游戏。项目通过“宏观周期 → 市场选择 → 板块配置 → 重仓股票选择 → 仓位管理 → 年度复盘”的长期回合制流程，帮助用户理解全球市场差异、行业轮动、长期复利与风险控制。

## 当前阶段

本项目当前处于设计与 MVP 初始化阶段。首版目标是实现一个本地可运行的简易网页版本：

- 前端-only，不接后端。
- 不接真实行情。
- 内置 100 只跨市场、跨行业的代表性股票池，仅用于教学模拟，不接实盘行情。
- 不构成任何真实证券投资建议。
- 默认无限轮次，玩家可一直游戏直到主动结束；同时保留固定 20 年模式。

## 核心设定

- 玩家以 100 万模拟本金开始。
- 每年先选择目标市场和板块，再从系统推荐的 6 只股票中选择 3 只重仓持有；只有主动选择现金模式才可跳过股票选择。
- 如果长期重仓、逆周期、风控失控，玩家可能被提前清仓并结束游戏。
- 最终结局不少于 10 种，并展示总盈利/亏损、盈利年份、亏损年份、最好/最差年份、最大回撤、年化收益等统计信息。

## 文档

- [需求梳理](docs/01-requirements.md)
- [结构化头脑风暴](docs/02-brainstorming.md)
- [设计规范](docs/03-design-spec.md)
- [开发计划](docs/04-development-plan.md)
- [内容治理与脱敏规范](docs/05-content-governance.md)
- [MVP 验收标准](docs/06-mvp-acceptance.md)

## 预期技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand 或 React Context
- Zod
- Vitest
- localStorage

## 部署到 Vercel

本项目是纯前端 Vite 应用，线上部署只需要托管 `pnpm build` 生成的 `dist/` 目录。

### 通过 Vercel 网站部署

1. 将项目推送到 GitHub / GitLab / Bitbucket 仓库。
2. 在 Vercel 中选择 **Add New Project** 并导入该仓库。
3. Vercel 会读取 `vercel.json`，使用以下配置：
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Framework: `vite`
4. 点击 Deploy，完成后用手机浏览器打开 Vercel 返回的线上 URL 即可游玩。

### 通过 Vercel CLI 部署

```bash
pnpm install
pnpm build
pnpm dlx vercel
pnpm dlx vercel --prod
```

首次执行 `pnpm dlx vercel` 时，按提示登录 Vercel 并关联项目。预览无误后，执行 `pnpm dlx vercel --prod` 发布正式线上版本。

## 产品边界

本项目是教育型投资模拟网页应用，不是实盘投资辅助工具。它与相邻目录中的 `fundpilot/` 项目保持独立：不复用其真实投资辅助、行情抓取、基金持仓、SQLite 投资记录或 14:30 决策工作流。
