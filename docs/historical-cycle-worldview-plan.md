# Historical Cycle Worldview Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the abstract repeating macro cycle with a 2005-2024 historical-cycle campaign that teaches real global market regimes and crisis rhythm.

**Architecture:** Keep the existing frontend-only static-content architecture. Extend `YearScenario` with historical teaching fields, bind events directly through scenario `eventIds`, and keep simulation explainable through the existing market, sector, event, risk, and stock-return channels.

**Tech Stack:** React, TypeScript, Vite, Zustand, Vitest, Zod.

---

### Task 1: Historical Scenario Contract

**Files:**
- Modify: `src/domain/types/game.ts`
- Modify: `src/domain/content/schemas.ts`
- Test: `tests/unit/content.test.ts`

- [ ] Add tests that require 20 historical scenarios, strict `historicalYear` order from 2005 to 2024, and educational fields for macro line, leading/lagging themes, market features, monetary policy, supply-demand, and market performance.
- [ ] Run `pnpm vitest run tests/unit/content.test.ts` and verify the new tests fail because fields do not exist.
- [ ] Extend `YearScenario` and `yearScenarioSchema` with the required historical fields.
- [ ] Run the content test again and verify type/schema failures now point to scenario data.

### Task 2: Historical Timeline Data

**Files:**
- Replace: `src/data/cycles/scenarios.ts`
- Test: `tests/unit/content.test.ts`

- [ ] Replace the synthetic six-cycle rotation with explicit 2005-2024 scenario objects.
- [ ] Cover the required historical anchors: dot-com as pre-history, 2008 subprime crisis, 2015 liquidity tightening, 2019 trade friction, 2020 pandemic recession, 2022 aggressive Fed hikes, and 2023-2024 AI cycle.
- [ ] Encode preferred markets/sectors and warning sectors for each year.
- [ ] Run `pnpm vitest run tests/unit/content.test.ts` and verify it passes.

### Task 3: Historical Event Binding

**Files:**
- Modify: `src/data/events/events.ts`
- Modify: `src/domain/simulation/engine.ts`
- Test: `tests/unit/simulation.test.ts`

- [ ] Add tests that major crisis events are scenario-bound, occur every 3-5 years, and materially suppress exposed returns.
- [ ] Run `pnpm vitest run tests/unit/simulation.test.ts` and verify the event tests fail against current black-swan scheduler behavior.
- [ ] Replace abstract events with historical small and major events.
- [ ] Change `getHeavyBlackSwanEventsForYear` to derive major crisis events from scenario-bound event data instead of synthetic scheduling.
- [ ] Avoid double-applying scheduled black swans in `simulateYear`.
- [ ] Run simulation tests until green.

### Task 4: Annual Brief Teaching UI

**Files:**
- Modify: `src/pages/AnnualBriefPage.tsx`

- [ ] Show real historical year, macro line, monetary policy, supply-demand relation, market characteristics, leading themes, lagging themes, and major-market performance.
- [ ] Keep the existing market/sector/warning chips so allocation decisions remain readable.
- [ ] Run `pnpm build` to verify TypeScript and production build.

### Task 5: Final Verification

**Files:**
- All touched files.

- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Review `git diff --stat` and touched files for scope.
