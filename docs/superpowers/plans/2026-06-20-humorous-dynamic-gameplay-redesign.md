# Humorous Dynamic Gameplay Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the annual game loop into a fun, stock-page-like, dynamic market simulation with event choices, mindset effects, NPC/rival pressure, visible per-stock returns, desktop cockpit UI, and mobile event-first UI.

**Architecture:** Keep the existing frontend-only React/Zustand/Vite app. Add pure domain types and deterministic engine helpers first, then wire those helpers into Zustand and page components. UI changes should reuse existing pages where practical, but present them as a desktop three-tab cockpit and a mobile event-first flow.

**Tech Stack:** React 18, TypeScript, Zustand persist, Tailwind CSS, Vitest, Testing Library.

---

## File Structure

- Modify `src/domain/types/game.ts`: add event-decision, mindset, NPC, rival, trade-cost, and per-stock return types.
- Create `src/data/interactions/eventDecisions.ts`: static decision content mapped to existing historical event ids.
- Create `src/data/interactions/npcMessages.ts`: deterministic NPC and rival message templates.
- Modify `src/domain/simulation/engine.ts`: add deterministic event decision selection/resolution, mindset derivation, trade-cost calculation, per-stock return breakdowns, rival snapshot labels, and humorous review helpers.
- Modify `src/features/campaign-flow/gameStore.ts`: store previous allocation, active mindset, pending decision, decision history, and NPC messages; resolve event choice before settlement.
- Modify `src/domain/simulation/allocationTemplates.ts`: make all six templates fully actionable and include sensible focus defaults through helper selection logic.
- Modify `src/pages/AnnualBriefPage.tsx`: compact humorous market overview with collapsible history and event decision entry.
- Modify `src/pages/AllocationPage.tsx`: desktop three-column stock-board layout, template autofill, reuse last year, selected basket, trading-loss preview.
- Modify `src/pages/SettlementPage.tsx`: visual performance card, per-stock return table, rival ranking, roast lines, stronger next-year CTA, quieter exit buttons.
- Modify `src/pages/ReviewPage.tsx`: short humorous review and next-year transition.
- Modify `src/pages/EndingPage.tsx`: updated ranking/ending labels where needed.
- Modify `src/app/App.tsx`: responsive shell behavior and game status routing if needed.
- Modify `src/styles.css`: CSS-only pulse, ticker-board, compact mobile episode, and chart styles.
- Modify `tests/unit/simulation.test.ts`: domain behavior tests.
- Add `tests/unit/interactions.test.ts`: decision/mindset/NPC/trade-cost tests.
- Add `tests/unit/ui-flow.test.tsx`: core UI rendering and interaction tests.

---

### Task 1: Domain Types and Interaction Fixtures

**Files:**
- Modify: `src/domain/types/game.ts`
- Create: `src/data/interactions/eventDecisions.ts`
- Create: `src/data/interactions/npcMessages.ts`
- Test: `tests/unit/interactions.test.ts`

- [ ] **Step 1: Write the failing test for decision fixtures**

```ts
import { describe, expect, it } from 'vitest'
import { scenarios } from '../../src/data/cycles/scenarios'
import { eventDecisions } from '../../src/data/interactions/eventDecisions'

describe('interaction fixtures', () => {
  it('provides decision options for meaningful historical events', () => {
    const scenarioEventIds = new Set(scenarios.flatMap((scenario) => scenario.eventIds))
    expect(eventDecisions.length).toBeGreaterThanOrEqual(8)
    expect(eventDecisions.every((decision) => scenarioEventIds.has(decision.eventId))).toBe(true)
    expect(eventDecisions.every((decision) => decision.options.length === 2)).toBe(true)
    expect(eventDecisions.flatMap((decision) => decision.options).every((option) => option.roast.length > 6)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/interactions.test.ts`

Expected: FAIL because `src/data/interactions/eventDecisions.ts` does not exist.

- [ ] **Step 3: Add interaction types**

In `src/domain/types/game.ts`, add:

```ts
export type MindsetDebuffId =
  | 'overconfident-all-in'
  | 'numb-after-loss'
  | 'anxious-chaser'
  | 'break-even-bagger'
  | 'contrarian-influencer'

export type MindsetDebuff = {
  id: MindsetDebuffId
  title: string
  roast: string
  returnMultiplier: number
  volatilityMultiplier: number
}

export type EventDecisionOption = {
  id: string
  label: string
  roast: string
  returnModifier: number
  volatilityModifier: number
  affectedMarkets?: MarketId[]
  affectedSectors?: SectorId[]
  mindsetDebuffId?: MindsetDebuffId
  riskAppetiteShift?: number
}

export type EventDecision = {
  id: string
  eventId: string
  title: string
  prompt: string
  options: EventDecisionOption[]
}

export type EventDecisionResult = {
  decision: EventDecision
  option: EventDecisionOption
}

export type NpcMessage = {
  id: string
  role: 'buddy' | 'influencer' | 'rival'
  tone: 'bullish' | 'bearish' | 'mocking' | 'warning' | 'celebrating'
  text: string
}

export type RivalSnapshot = {
  yearlyBeatPercent: number
  topPercent: number
  label: string
  roast: string
}

export type TradeCostBreakdown = {
  turnover: number
  concentrationPenalty: number
  totalCost: number
  roast: string
}

export type StockReturnEntry = {
  stock: Stock
  annualReturn: number
  baseReturn: number
  marketCycleBonus: number
  sectorCycleBonus: number
  eventImpact: number
  stockShock: number
  eventTags: string[]
}
```

Update `StockReturnBreakdown`:

```ts
export type StockReturnBreakdown = {
  selectedStocks: Stock[]
  entries: StockReturnEntry[]
  contribution: number
  averageReturn: number
  averageVolatility: number
}
```

Extend `Allocation`:

```ts
eventDecisionOptionId?: string
followedNpcSignal?: boolean
```

Extend `YearResult`:

```ts
eventDecisionResult?: EventDecisionResult
mindsetEffect?: MindsetDebuff
tradeCost: TradeCostBreakdown
rivalSnapshot: RivalSnapshot
roastLines: string[]
```

Extend `GameState`:

```ts
previousAllocation?: Allocation
activeMindset?: MindsetDebuff
pendingDecision?: EventDecision
decisionHistory: EventDecisionResult[]
npcMessages: NpcMessage[]
```

- [ ] **Step 4: Add event decision fixtures**

Create `src/data/interactions/eventDecisions.ts` with 8-10 decisions mapped to existing `events` ids:

```ts
import type { EventDecision } from '../../domain/types/game'

export const eventDecisions: EventDecision[] = [
  {
    id: 'stock-connect-chase-or-wait',
    eventId: 'stock-connect-2014',
    title: '沪港通开门，资金开始排队冲 A 股',
    prompt: '群里已经开始晒券商涨停截图，你打算怎么动？',
    options: [
      {
        id: 'chase-broker-tech',
        label: '跟风加仓金融科技',
        roast: '你不是在配置资产，你是在给牛市气氛组打赏。',
        returnModifier: 0.035,
        volatilityModifier: 0.025,
        affectedMarkets: ['a-share', 'h-share'],
        affectedSectors: ['financials', 'technology'],
        mindsetDebuffId: 'anxious-chaser',
      },
      {
        id: 'hold-balanced',
        label: '保持配置，拒绝上头',
        roast: '嘴上说不追高，手指已经在买入键上抖了三下。',
        returnModifier: -0.012,
        volatilityModifier: -0.008,
      },
    ],
  },
]
```

Add similar entries for `crisis-subprime-2008`, `crisis-euro-debt-2011`, `crisis-liquidity-tightening-2015`, `crisis-global-tightening-2018`, `crisis-pandemic-2020`, `new-energy-boom-2021`, `crisis-fed-hike-2022`, and an AI/tech 2023 event if present in `events.ts`.

- [ ] **Step 5: Add NPC templates**

Create `src/data/interactions/npcMessages.ts` with short message pools:

```ts
export const npcMessagePools = {
  gain: ['可以啊兄弟，这次总算跑赢 90% 散户，别刚赚一点就想着销户享受。'],
  loss: ['关灯面给你准备好了，重仓赛道的时候你可不是这么冷静。'],
  blackSwan: ['市场一开盘就像撤退演习，谁裸泳现在看得很清楚。'],
  idle: ['今天群里三个人喊牛市，四个人喊销户，含金量基本为零。'],
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/interactions.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/domain/types/game.ts src/data/interactions/eventDecisions.ts src/data/interactions/npcMessages.ts tests/unit/interactions.test.ts
git commit -m "feat: add annual interaction domain fixtures"
```

---

### Task 2: Pure Simulation Helpers for Decisions, Mindset, Trade Costs, Rivalry, and Stock Returns

**Files:**
- Modify: `src/domain/simulation/engine.ts`
- Test: `tests/unit/interactions.test.ts`
- Test: `tests/unit/simulation.test.ts`

- [ ] **Step 1: Write failing tests for deterministic interaction helpers**

Add to `tests/unit/interactions.test.ts`:

```ts
import {
  calculateTradeCost,
  deriveMindsetDebuff,
  resolveEventDecision,
  selectYearDecision,
} from '../../src/domain/simulation/engine'
import { allocationTemplates } from '../../src/domain/simulation/allocationTemplates'
import { createInitialGame } from '../../src/features/campaign-flow/gameStore'

it('selects deterministic event decisions from the current scenario', () => {
  const game = createInitialGame()
  const scenario = scenarios.find((item) => item.historicalYear === 2014)!
  const decision = selectYearDecision(game, scenario)
  expect(decision?.eventId).toBe('stock-connect-2014')
})

it('resolves event decisions by option id', () => {
  const decision = eventDecisions[0]
  const result = resolveEventDecision(decision, decision.options[0].id)
  expect(result.option.id).toBe(decision.options[0].id)
})

it('derives overconfidence after a large gain', () => {
  const game = {
    ...createInitialGame(),
    history: [{ annualReturn: 0.38 } as ReturnType<typeof simulateYear>],
  }
  expect(deriveMindsetDebuff(game)?.id).toBe('overconfident-all-in')
})

it('charges lower turnover cost when reusing last year allocation', () => {
  const same = calculateTradeCost(allocationTemplates.steady, allocationTemplates.steady)
  const changed = calculateTradeCost(allocationTemplates.steady, allocationTemplates.growth)
  expect(same.totalCost).toBeLessThan(changed.totalCost)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/unit/interactions.test.ts`

Expected: FAIL because helper exports do not exist.

- [ ] **Step 3: Implement helper functions in `engine.ts`**

Add exported helpers:

```ts
export function selectYearDecision(game: GameState, scenario: YearScenario): EventDecision | undefined {
  const candidates = eventDecisions.filter((decision) => scenario.eventIds.includes(decision.eventId))
  if (!candidates.length) return undefined
  if (scenario.year % 2 === 0 || candidates.some((decision) => getEventById(decision.eventId)?.type === 'black-swan')) {
    return candidates[0]
  }
  return undefined
}
```

```ts
export function resolveEventDecision(decision: EventDecision, optionId?: string): EventDecisionResult {
  const option = decision.options.find((item) => item.id === optionId) ?? decision.options[0]
  return { decision, option }
}
```

```ts
export function deriveMindsetDebuff(game: GameState): MindsetDebuff | undefined {
  const last = game.history.at(-1)
  const previous = game.history.at(-2)
  if (!last) return undefined
  if (last.annualReturn >= 0.28) return mindsetDebuffs['overconfident-all-in']
  if (last.annualReturn <= -0.22) return mindsetDebuffs['numb-after-loss']
  if (previous && previous.annualReturn < 0 && last.annualReturn < 0) return mindsetDebuffs['break-even-bagger']
  return undefined
}
```

```ts
export function calculateTradeCost(previous: Allocation | undefined, current: Allocation): TradeCostBreakdown {
  if (!previous) return { turnover: 0, concentrationPenalty: 0, totalCost: 0, roast: '第一年开户，券商还没来得及收割你的手速。' }
  const marketTurnover = sum(markets.map((market) => Math.abs((previous.marketWeights[market.id] ?? 0) - (current.marketWeights[market.id] ?? 0)))) / 2
  const sectorTurnover = sum(sectors.map((sector) => Math.abs((previous.sectorWeights[sector.id] ?? 0) - (current.sectorWeights[sector.id] ?? 0)))) / 2
  const investedTurnover = Math.abs(previous.investedRatio - current.investedRatio) / 2
  const stockTurnover = Math.max(0, 3 - (previous.selectedStocks ?? []).filter((id) => current.selectedStocks?.includes(id)).length) / 3
  const concentration = calculateConcentration(current).concentration
  const concentrationPenalty = concentration > 0.6 ? (concentration - 0.6) * 0.045 : 0
  const turnover = roundRate(marketTurnover * 0.25 + sectorTurnover * 0.25 + investedTurnover * 0.25 + stockTurnover * 0.02)
  const totalCost = roundRate(clamp(turnover + concentrationPenalty, 0, 0.08))
  return { turnover, concentrationPenalty: roundRate(concentrationPenalty), totalCost, roast: totalCost > 0.025 ? '一年换三次信仰，手续费先把你教育了一遍。' : '这次手没那么痒，交易损耗还算克制。' }
}
```

Also add `calculateRivalSnapshot`, `buildNpcMessages`, and `buildRoastLines` as exported pure helpers.

- [ ] **Step 4: Write failing test for per-stock return entries**

Update `tests/unit/simulation.test.ts`:

```ts
it('explains selected stock returns with per-stock event impact entries', () => {
  const scenario = scenarios.find((item) => item.historicalYear === 2014)!
  const game = { ...createInitialGame(), pendingDecision: selectYearDecision(createInitialGame(), scenario) }
  const recommendations = recommendStocks({ year: scenario.year, marketId: 'a-share', sectorId: 'technology', scenario })
  const allocation = {
    ...allocationTemplates.growth,
    selectedMarketId: 'a-share',
    selectedSectorId: 'technology',
    selectedStocks: recommendations.slice(0, 3).map((stock) => stock.id),
    eventDecisionOptionId: game.pendingDecision?.options[0].id,
  }
  const result = simulateYear(game, scenario, allocation)
  expect(result.stockResult.entries).toHaveLength(3)
  expect(result.stockResult.entries.some((entry) => entry.eventImpact !== 0)).toBe(true)
  expect(result.stockResult.entries[0]).toHaveProperty('marketCycleBonus')
})
```

- [ ] **Step 5: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/simulation.test.ts`

Expected: FAIL because `entries` and event-decision stock impacts are not implemented.

- [ ] **Step 6: Extend `calculateStockReturn`**

Make it return `entries`. For each selected stock:

- Keep current base logic.
- Add event decision impact when selected option affects stock market or sector.
- Add black-swan and event tags.
- Store each component in `StockReturnEntry`.
- Compute basket average from `entries.map((entry) => entry.annualReturn)`.

- [ ] **Step 7: Integrate trade cost and mindset into `simulateYear`**

In `simulateYear`:

- Resolve `game.pendingDecision` using `allocation.eventDecisionOptionId`.
- Calculate `tradeCost`.
- Apply `eventDecisionResult.option.returnModifier` by exposure.
- Apply `eventDecisionResult.option.volatilityModifier` by exposure.
- Apply `game.activeMindset` bounded multipliers.
- Subtract `tradeCost.totalCost` from annual return.
- Include `tradeCost`, `eventDecisionResult`, `mindsetEffect`, `rivalSnapshot`, and `roastLines` in `YearResult`.

- [ ] **Step 8: Run focused tests**

Run:

```bash
pnpm vitest run tests/unit/interactions.test.ts tests/unit/simulation.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

Run:

```bash
git add src/domain/simulation/engine.ts tests/unit/interactions.test.ts tests/unit/simulation.test.ts
git commit -m "feat: add dynamic simulation interactions"
```

---

### Task 3: Zustand Flow and Allocation Reuse

**Files:**
- Modify: `src/features/campaign-flow/gameStore.ts`
- Test: `tests/unit/interactions.test.ts`

- [ ] **Step 1: Write failing store tests**

Add tests:

```ts
import { applyYearResult, selectYearDecision } from '../../src/domain/simulation/engine'

it('stores previous allocation and prepares next year interaction state', () => {
  let game = createInitialGame()
  const scenario = scenarios[0]
  const result = simulateYear(game, scenario, { ...allocationTemplates.steady, selectedStocks: [] })
  game = applyYearResult(game, result)
  expect(game.previousAllocation).toEqual(result.allocation)
  const nextScenario = scenarios[1]
  const nextDecision = selectYearDecision(game, nextScenario)
  expect(nextDecision === undefined || nextDecision.eventId).toBeTruthy()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/interactions.test.ts`

Expected: FAIL because initial state and result application do not maintain new fields.

- [ ] **Step 3: Update `createInitialGame`**

Add:

```ts
decisionHistory: [],
npcMessages: [],
activeMindset: undefined,
pendingDecision: undefined,
previousAllocation: undefined,
```

- [ ] **Step 4: Update `startGame` and year transitions**

- On `startGame`, derive `pendingDecision` for year 1 if one exists.
- On `advanceYear`, increment year and set:
  - `activeMindset: deriveMindsetDebuff(game)`
  - `pendingDecision: selectYearDecision(nextGame, nextScenario)`
  - `npcMessages: buildNpcMessages(nextGame, nextScenario)`
  - `lastResult: undefined`
  - `exitPrompt: undefined`

- [ ] **Step 5: Update `submitAllocation` and `applyYearResult`**

- `simulateYear` consumes `game.pendingDecision` and allocation selected option.
- `applyYearResult` stores `previousAllocation: result.allocation`.
- If `result.eventDecisionResult` exists, append it to `decisionHistory`.
- Store settlement NPC messages from `buildNpcMessages(game, scenario, result)`.

- [ ] **Step 6: Run tests**

Run: `pnpm vitest run tests/unit/interactions.test.ts tests/unit/simulation.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/features/campaign-flow/gameStore.ts tests/unit/interactions.test.ts
git commit -m "feat: persist annual interaction state"
```

---

### Task 4: Desktop Cockpit and Mobile Event-First UI

**Files:**
- Modify: `src/pages/AnnualBriefPage.tsx`
- Modify: `src/pages/AllocationPage.tsx`
- Modify: `src/pages/SettlementPage.tsx`
- Modify: `src/pages/ReviewPage.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/styles.css`
- Add: `tests/unit/ui-flow.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Create `tests/unit/ui-flow.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AllocationPage } from '../../src/pages/AllocationPage'
import { AnnualBriefPage } from '../../src/pages/AnnualBriefPage'

describe('redesigned annual UI', () => {
  it('renders cockpit tabs and collapsed historical background', () => {
    render(<AnnualBriefPage />)
    expect(screen.getByText('年度行情速览')).toBeInTheDocument()
    expect(screen.getByText('一键资产配置')).toBeInTheDocument()
    expect(screen.getByText('年度结算 & 复盘')).toBeInTheDocument()
    expect(screen.getByText('展开完整历史背景')).toBeInTheDocument()
  })

  it('lets players reuse last year allocation when available', () => {
    render(<AllocationPage />)
    expect(screen.getByText('延续去年配置')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run UI tests to verify they fail**

Run: `pnpm vitest run tests/unit/ui-flow.test.tsx`

Expected: FAIL because cockpit labels and reuse control are missing.

- [ ] **Step 3: Build shared UI helpers inside pages**

Keep helpers local unless reused across three pages:

- `CockpitTabs`
- `MarketPulseTags`
- `EventDecisionPanel`
- `NpcMessageStrip`
- `StockBoard`
- `SelectedBasket`
- `MiniAccountCurve`
- `PerStockReturnBoard`

If a helper exceeds 100-150 lines or is reused by multiple pages, create under `src/shared/ui/`.

- [ ] **Step 4: Update `AnnualBriefPage`**

Desktop:

- Render tab rail labels.
- Show compact annual headline and humorous summary.
- Show leading/lagging/favorable tags.
- Show pending event decision panel when `game.pendingDecision` exists.
- Use `<details><summary>展开完整历史背景</summary>...</details>` for original macro details.

Mobile:

- Put NPC message and event panel before the rest.
- Keep content single-column.

- [ ] **Step 5: Update `AllocationPage`**

Desktop layout:

```tsx
<div className="allocation-cockpit">
  <TemplatePanel />
  <WeightConsole />
  <StockBoard />
</div>
```

Required behavior:

- Template click replaces full allocation.
- Template click also updates `selectedMarketId` and `selectedSectorId` from highest template weights.
- `延续去年配置` copies `game.previousAllocation` if available.
- Stock board filters recommendations by selected market/sector.
- Stock board looks like quote rows with return/volatility/event chips.
- Selected basket shows `拟买入`/`持有`/`调出` labels by comparing previous selected stocks.
- The submit button remains disabled until validation passes.

- [ ] **Step 6: Update `SettlementPage`**

Replace dense stats grid with:

- Performance card: start assets, end assets, annual return, P/L.
- Mini account curve from `game.history`.
- Per-stock return board using `result.stockResult.entries`.
- Trade-cost card using `result.tradeCost`.
- Rival card using `result.rivalSnapshot`.
- Roast lines from `result.roastLines`.
- NPC message strip from `game.npcMessages`.
- Primary gradient button for next/review.
- Quiet exit buttons in a low-emphasis area.

- [ ] **Step 7: Update `ReviewPage`**

- Convert review items into short roast cards.
- Remove textbook phrasing.
- Strong next-year CTA.

- [ ] **Step 8: Add CSS**

In `src/styles.css`, add CSS classes:

```css
.market-pulse { animation: market-pulse 1.8s ease-in-out infinite; }
@keyframes market-pulse { 0%, 100% { transform: translateY(0); opacity: 0.9; } 50% { transform: translateY(-1px); opacity: 1; } }
.stock-board-row { display: grid; grid-template-columns: minmax(120px, 1.2fr) repeat(4, minmax(72px, auto)); gap: 0.5rem; }
.mobile-episode { scroll-snap-type: y proximity; }
```

Keep styles responsive and avoid heavy animation dependencies.

- [ ] **Step 9: Run UI tests**

Run: `pnpm vitest run tests/unit/ui-flow.test.tsx`

Expected: PASS.

- [ ] **Step 10: Commit**

Run:

```bash
git add src/pages src/app/App.tsx src/styles.css tests/unit/ui-flow.test.tsx
git commit -m "feat: redesign annual cockpit UI"
```

---

### Task 5: Content Humor, Compliance Cleanup, and End-to-End Verification

**Files:**
- Modify: `src/data/cycles/scenarios.ts`
- Modify: `src/data/events/events.ts`
- Modify: `src/data/stocks/stockPool.ts`
- Modify: `src/data/endings/endings.ts`
- Modify: `src/domain/content/schemas.ts` if schemas need new fields
- Modify: `tests/unit/content.test.ts`

- [ ] **Step 1: Write failing compliance/content tests**

Update `tests/unit/content.test.ts`:

```ts
it('uses desensitized visible stock names', () => {
  const forbidden = ['英伟达', '苹果', '微软', '谷歌', '特斯拉', '台积电', '三星电子', '腾讯控股', '贵州茅台']
  const visible = stockPool.map((stock) => `${stock.name} ${stock.description}`).join('\n')
  forbidden.forEach((name) => {
    expect(visible).not.toContain(name)
  })
})

it('keeps annual summaries compact and supports historical detail separately', () => {
  scenarios.forEach((scenario) => {
    expect(scenario.summary.length).toBeLessThanOrEqual(90)
    expect(scenario.macroMainline.length).toBeGreaterThan(12)
  })
})
```

- [ ] **Step 2: Run content test to verify it fails**

Run: `pnpm vitest run tests/unit/content.test.ts`

Expected: FAIL because visible stock names currently include real names and some summaries may exceed compact length.

- [ ] **Step 3: Desensitize stock names**

Apply current governance examples:

- `英伟达` -> `英伟大`
- `苹果` -> `苹国`
- `微软` -> `微硬`
- `谷歌` -> `谷鸽`
- `特斯拉` -> `特思拉`
- `台积电` -> `台晶电`
- `三星电子` -> `三新电子`
- `腾讯控股` -> `腾迅控股`
- `贵州茅台` -> `贵州茅坛`

Also shorten stock descriptions to one meme-like sentence while retaining style:

```ts
stock('us-technology-nvidia', '英伟大', 'us', 'technology', 'leader', 0.22, 0.42, 100, '算力信仰充值入口，涨时封神，跌时全群沉默。')
```

- [ ] **Step 4: Rewrite visible annual summaries**

Keep detailed fields for collapsed background, but rewrite `summary`, `leadingThemes`, and `laggingThemes` to be compact and market-native. Prioritize key years first:

- 2008
- 2014
- 2015
- 2018
- 2020
- 2021
- 2022
- 2023
- 2024

- [ ] **Step 5: Update ending/ranking labels**

In engine or ending data, use:

- `周期收割者，完美避开各路资本套路`
- `标准反复被割散户，牛市喝汤熊市深套`
- `天台常驻选手，教科书级踩坑合集`

- [ ] **Step 6: Run content tests**

Run: `pnpm vitest run tests/unit/content.test.ts`

Expected: PASS.

- [ ] **Step 7: Full verification**

Run:

```bash
pnpm test
pnpm lint
pnpm build
```

Expected: all pass.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/data src/domain/content/schemas.ts tests/unit/content.test.ts
git commit -m "feat: refresh market humor and compliance copy"
```

---

## Manual QA Checklist

- [ ] Desktop starts into a compact annual cockpit with three tabs.
- [ ] Mobile starts with NPC/event-first flow.
- [ ] Event decision appears in known event years and can be selected.
- [ ] Different event choices visibly change annual return or volatility.
- [ ] `延续去年配置` copies the previous allocation and lowers trade cost.
- [ ] Stock board looks like a market watchlist, not generic content cards.
- [ ] Settlement shows per-stock annual returns and event impact components.
- [ ] Large market/sector concentration over 60% increases cost or volatility.
- [ ] Rival ranking creates pressure without backend dependency.
- [ ] Exit buttons are visually weaker than next-year CTA.
- [ ] Disclaimer remains visible on appropriate surfaces.
- [ ] No visible real stock names/tickers/logos remain.
