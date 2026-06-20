# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Scope

This repository is for “全球周期投资模拟器”, an educational browser game for beginner secondary-market investors. The product teaches the loop: macro beta → market selection → sector allocation → position sizing → annual review → long-term survival.

The project is separate from neighboring finance projects. Do not mix it with `../fundpilot/`, which is a Python CLI real-investment assistant for local fund management.

## Architecture Direction

The MVP should be a frontend-only React/TypeScript/Vite app with local state and localStorage persistence. It should not introduce a backend, account system, real-time market data, real ticker data, or deployment work until the local playable MVP is validated.

Core layers:

- `src/data/`: static content for cycles, markets, sectors, events, endings, and review templates.
- `src/domain/`: pure simulation, scoring, liquidation, statistics, event, content, and type logic.
- `src/features/`: feature-level orchestration for campaign flow, annual brief, allocation, settlement, review, liquidation, and ending.
- `src/pages/`: route/page shells for the user journey.
- `src/shared/`: reusable UI, library helpers, and constants.
- `tests/`: unit and integration tests for the pure rules and high-level flows.

## Commands

Once the Vite project is initialized, expected commands are:

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
pnpm lint
```

Run a single Vitest file with:

```bash
pnpm vitest run tests/unit/<file>.test.ts
```

## Product Rules

- Preserve an at-least-20-year campaign loop for completed runs.
- The player starts as a 0-year beginner with 1,000,000 simulated capital.
- Each year follows: annual macro report → allocation → settlement → review.
- A player may end before year 20 if total assets breach the liquidation line or repeated high-risk mistakes trigger forced clearing.
- Markets: A股, H股, 美股, 日股, 台股, 韩股.
- Sectors: 消费, 科技, 医药, 新能源, 有色, 金融, 军工, 农业.
- Annual results must be explainable from macro cycle, market fit, sector fit, events, and risk control.
- Randomness is allowed only as bounded perturbation; it must not dominate the strategy logic.
- Every completed year should produce educational feedback, not just a return number.
- Ending definitions must include at least 10 possible outcomes and cover profitable, loss-making, conservative, growth, learning, and early-liquidation paths.
- Final results must include profit/loss statistics: total P/L, total return, annualized return, profit years, loss years, best/worst year, max drawdown, and early-end reason if applicable.

## Content and Compliance

Visible product content must not include real stock names, ticker symbols, logos, historical K-line screenshots, or uniquely identifying company facts.

If stock-like teaching names are needed, use desensitized near-style names such as:

- 英伟达 → 英伟大
- 苹果 → 苹国
- 特斯拉 → 特思拉
- 台积电 → 台晶电
- 三星电子 → 三新电子
- 腾讯控股 → 腾迅控股
- 阿里巴巴 → 阿理巴巴
- 贵州茅台 → 贵州茅坛

Include the disclaimer in user-visible surfaces: “本产品为教育模拟工具，所有资产名称均为教学抽象原型，不构成任何真实证券投资建议。”

## Key Docs

- `docs/01-requirements.md`: product requirements and boundaries.
- `docs/02-brainstorming.md`: structured brainstorming decisions.
- `docs/03-design-spec.md`: detailed design specification.
- `docs/04-development-plan.md`: executable implementation plan.
- `docs/05-content-governance.md`: desensitization and content rules.
- `docs/06-mvp-acceptance.md`: MVP verification checklist.
