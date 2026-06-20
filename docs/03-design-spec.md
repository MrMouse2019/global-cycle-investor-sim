# Design Spec：全球周期投资模拟器 MVP

## 1. Overview

全球周期投资模拟器是一款前端-only 的教育型投资模拟网页游戏。玩家以 100 万模拟本金开始，经历至少 20 年长期投资周期，每年根据宏观周期报告进行市场、板块和仓位配置。系统用可解释规则计算年度收益、盈利/亏损金额、回撤、认知评分、板块敏感度和风控评分。若玩家资产跌破清仓线或长期风控失控，可能在 20 年前提前清仓结束游戏；否则在至少 20 年后生成最终结局和完整盈利/亏损统计。

## 2. Goals

- 建立“宏观 β → 市场 → 板块 → 仓位 → 复盘 → 长期生存”的投资学习闭环。
- 让新手理解不同周期下的市场和板块强弱。
- 用可解释结果代替随机涨跌。
- 通过风控评分和清仓机制惩罚梭哈、集中、逆周期行为。
- 输出盈利/亏损统计，让玩家理解收益路径、亏损年份、回撤和年化收益。
- 用本地网页 MVP 验证完整可玩性。

## 3. Non-goals

- 不接真实行情。
- 不展示真实股票名称、ticker、logo。
- 不提供真实证券投资建议。
- 不做后端、账号、排行榜。
- 不做部署上线。
- 不做个股精选模式。

## 4. User Journey

```text
Home
  → Start / Continue
Annual Brief
  → Read macro cycle and teaching hint
Allocation
  → Choose template or adjust market/sector/position weights
Settlement
  → See annual return, annual P/L, assets, drawdown, score changes
Liquidation Check
  → If triggered, go to Ending with early-end reason
Review
  → Read what was right, what was wrong, what to improve
Next Year
  → Repeat until at least year 20 if not liquidated
Ending
  → See final ending, profit/loss statistics, long-term stats, learning summary
```

## 5. Application State Machine

```text
idle
  -> briefing(year)
  -> allocating(year)
  -> settling(year)
  -> liquidated | reviewing(year)
  -> briefing(year + 1)
  -> ending
```

State transitions:

- `startGame()` creates initial `GameState`.
- `submitAllocation()` validates allocation and generates `YearResult`.
- `checkLiquidation()` runs after settlement.
- `completeReview()` advances to next year or ending.
- `resetGame()` clears localStorage and returns to `idle`.
- `continueGame()` restores saved `GameState`.

## 6. Domain Entities

### 6.1 GameState

```ts
type GameState = {
  status: 'idle' | 'briefing' | 'allocating' | 'settling' | 'reviewing' | 'ending' | 'liquidated'
  currentYear: number
  minYears: 20
  initialCapital: number
  liquidationLine: number
  cash: number
  totalAssets: number
  scores: PlayerScores
  history: YearResult[]
  flags: PlayerHabitFlags
  isEarlyEnded: boolean
  earlyEndReason?: string
}
```

### 6.2 PlayerScores

```ts
type PlayerScores = {
  marketCognition: number
  sectorSensitivity: number
  riskControl: number
}
```

### 6.3 PlayerHabitFlags

```ts
type PlayerHabitFlags = {
  allInYears: number
  concentratedYears: number
  inverseCycleYears: number
  cashHeavyYears: number
  highRiskEventExposureYears: number
  improvedAfterLossYears: number
}
```

### 6.4 YearScenario

```ts
type YearScenario = {
  year: number
  macroCycle: MacroCycle
  policy: 'loose' | 'neutral' | 'tight'
  riskPreference: 'high' | 'medium' | 'low'
  preferredMarkets: MarketId[]
  preferredSectors: SectorId[]
  warningSectors: SectorId[]
  events: EventCard[]
  teachingHint: string
}
```

### 6.5 Market

```ts
type Market = {
  id: MarketId
  name: string
  betaTraits: string[]
  suitableCycles: MacroCycle[]
  riskLevel: 1 | 2 | 3 | 4 | 5
  baseVolatility: number
}
```

### 6.6 Sector

```ts
type Sector = {
  id: SectorId
  name: string
  traits: string[]
  strongCycles: MacroCycle[]
  weakCycles: MacroCycle[]
  volatility: number
}
```

### 6.7 Allocation

```ts
type Allocation = {
  investedRatio: number
  marketWeights: Record<MarketId, number>
  sectorWeights: Record<SectorId, number>
  templateId?: string
}
```

### 6.8 EventCard

```ts
type EventCard = {
  id: string
  title: string
  type: 'macro' | 'region' | 'sector' | 'risk'
  description: string
  affectedMarkets?: MarketId[]
  affectedSectors?: SectorId[]
  returnImpact: number
  volatilityImpact: number
  reviewText: string
}
```

### 6.9 YearResult

```ts
type YearResult = {
  year: number
  allocation: Allocation
  annualReturn: number
  annualProfitLoss: number
  drawdown: number
  startAssets: number
  endAssets: number
  isProfitYear: boolean
  scoreDelta: PlayerScores
  appliedEvents: EventCard[]
  reviewItems: ReviewItem[]
  liquidationCheck?: LiquidationCheck
}
```

### 6.10 LiquidationCheck

```ts
type LiquidationCheck = {
  triggered: boolean
  reason?: string
  ruleId?: 'asset-line' | 'deep-drawdown' | 'repeated-concentration' | 'risk-event-exposure'
}
```

### 6.11 GameStats

```ts
type GameStats = {
  initialCapital: number
  finalAssets: number
  totalProfitLoss: number
  totalReturn: number
  annualizedReturn: number
  completedYears: number
  profitYears: number
  lossYears: number
  bestYearReturn: number
  worstYearReturn: number
  averageProfitYearReturn: number
  averageLossYearReturn: number
  maxDrawdown: number
  earlyEnded: boolean
  earlyEndReason?: string
}
```

### 6.12 Ending

```ts
type Ending = {
  id: string
  title: string
  category: 'top-profit' | 'profit' | 'neutral' | 'loss' | 'early-ended' | 'special'
  conditions: string[]
  description: string
  unlockedLessons: string[]
}
```

## 7. Content Model

Static content lives under `src/data/`:

- `cycles/`: at least 20 year scenarios and macro cycle definitions.
- `markets/`: six market profiles.
- `sectors/`: eight sector profiles.
- `events/`: event card pool.
- `endings/`: at least 10 ending definitions.

All content should be validated by Zod schemas before being used by the engine.

## 8. Simulation Rules

### 8.1 Return Formula

A year’s return is calculated from these factors:

```text
annualReturn =
  marketFitContribution
  + sectorFitContribution
  + policyRiskContribution
  + eventContribution
  + diversificationAdjustment
  + boundedLuck
```

Guidelines:

- Market fit and sector fit are primary drivers.
- Position sizing scales both upside and downside.
- Concentration can increase upside but reduces risk score and increases drawdown.
- Luck is small and deterministic per scenario or bounded random seed.

### 8.2 Market Fit

- Add positive contribution when selected markets match `preferredMarkets`.
- Add negative or muted contribution when selected markets conflict with the cycle.
- Higher risk markets should have higher upside and higher drawdown.

### 8.3 Sector Fit

- Add positive contribution for sectors in `preferredSectors`.
- Penalize overweight sectors in `warningSectors`.
- Defensive sectors should lose less in recession/stagflation scenarios.

### 8.4 Events

Events apply bounded impact only to their affected markets/sectors or all-risk preference. Every event must produce a review explanation. If an event contributes to liquidation, the result must explain that liquidation came from prior risk exposure plus event impact.

### 8.5 Risk Control

Risk control score considers:

- Invested ratio.
- Single-market concentration.
- Single-sector concentration.
- Drawdown.
- Repeated all-in behavior.
- Cash-only behavior over many years.
- High-risk event exposure without diversification or cash buffer.

### 8.6 Scoring

- Market cognition increases when market weights align with scenario-preferred markets.
- Sector sensitivity increases when sector weights align with strong sectors and avoid warning sectors.
- Risk control increases with reasonable diversification and falls with concentration, high drawdown, or repeated high-risk exposure.

Scores are clamped between 0 and 100.

## 9. Liquidation Rules

Run liquidation checks after each year’s settlement.

Trigger if any condition is met:

1. `endAssets <= initialCapital * 0.3`.
2. `maxDrawdown >= 0.7` and `riskControl < 30`.
3. Three consecutive or frequent high-concentration years plus cumulative loss over 50%.
4. Repeated high-risk event exposure with low diversification and low cash buffer.

Liquidation behavior:

- Set `isEarlyEnded = true`.
- Set `status = 'liquidated'` or route directly to `ending` with `earlyEnded = true`.
- Save `earlyEndReason`.
- Generate an early-ended conclusion and statistics.

## 10. Statistics Rules

After each settlement:

- `annualProfitLoss = endAssets - startAssets`.
- `isProfitYear = annualProfitLoss >= 0`.

At ending:

- `totalProfitLoss = finalAssets - initialCapital`.
- `totalReturn = totalProfitLoss / initialCapital`.
- `annualizedReturn = (finalAssets / initialCapital) ** (1 / completedYears) - 1`.
- `profitYears` and `lossYears` are counted from `history`.
- `bestYearReturn` and `worstYearReturn` come from yearly returns.
- `maxDrawdown` is the maximum historical drawdown.
- Average profit/loss year returns are calculated separately.

## 11. Ending Rules

Ending selection uses final return, statistics, average scores, max drawdown, early-ended status, and habit flags.

Minimum ending set:

1. `cycle-master`：周期洞察型职业投资人。
2. `global-allocator`：全球配置型资产管理人。
3. `steady-compounder`：稳健复利型长期赢家。
4. `growth-winner`：高波动成长型胜利者。
5. `sector-rotator`：板块轮动高手。
6. `learning-improver`：学习成长型投资人。
7. `market-follower`：随波逐流的市场参与者。
8. `cash-king`：极致风控的现金为王玩家。
9. `inverse-cycle-loser`：逆周期配置的长期亏损者。
10. `drawdown-giver-back`：高收益幻觉的回撤承受者。
11. `all-in-liquidated`：重仓梭哈的提前清仓者。
12. `black-swan-exposed`：黑天鹅裸奔的风险失控者。
13. `cycle-leek`：追涨杀跌的周期韭菜。
14. `lucky-risk-taker`：侥幸盈利的风险玩家。

Priority order should put early-ended endings first, then top outcomes, then special outcomes, then loss/neutral defaults.

## 12. Page Specs

### 12.1 Home Page

Content:

- Product title.
- One-sentence learning promise.
- Explain at-least-20-year long-term cycle and possible early liquidation.
- Start game button.
- Continue button if local save exists.
- Disclaimer.

### 12.2 Annual Brief Page

Content:

- Current year progress.
- Macro cycle, policy, risk preference.
- Market and sector hint.
- One beginner-friendly knowledge card.

Primary action: proceed to allocation.

### 12.3 Allocation Page

Content:

- Portfolio template selector.
- Invested ratio control.
- Market weight controls.
- Sector weight controls.
- Validation summary.

Primary action: submit allocation.

### 12.4 Settlement Page

Content:

- Annual return.
- Annual profit/loss amount.
- Start/end asset values.
- Estimated drawdown.
- Score deltas.
- Event impacts.
- Liquidation check status.

Primary action: read review or view liquidation ending.

### 12.5 Review Page

Content:

- 1-2 correct decisions.
- 1-2 mistakes or missed opportunities.
- Next-year learning advice.

Primary action: next year or final ending.

### 12.6 Ending Page

Content:

- Ending title.
- Final asset value and total return.
- Total profit/loss amount.
- Annualized return.
- Completed years.
- Profit years and loss years.
- Best year and worst year.
- Average profit/loss year returns.
- Max drawdown.
- Early-ended flag and reason if applicable.
- Final scores.
- Habit diagnosis.
- Unlocked lessons.
- Restart button.

## 13. Persistence

Use one localStorage key:

```text
global-cycle-investor-sim.save.v1
```

Saved data:

- Current game state.
- History.
- Last updated timestamp.
- Early-ended state and reason if applicable.

No personal data is stored.

## 14. Accessibility and UX

- Avoid tiny numeric-only controls; use sliders or preset buttons where possible.
- Keep result explanations in plain Chinese.
- Important score changes should include text labels, not color alone.
- Liquidation explanations must be direct and educational, not punitive.
- All primary actions should be reachable by keyboard.

## 15. Desensitization Requirements

- No real stock names, ticker symbols, logos, or unique company identifiers in frontend-visible content.
- If stock-like examples are introduced, use desensitized names from `docs/05-content-governance.md`.
- Display disclaimer on home and at least one persistent footer or result area.

## 16. Acceptance Criteria

- A user can complete a full at-least-20-year game locally if not liquidated.
- A user can be liquidated early when severe risk rules are triggered.
- All six markets and eight sectors are represented.
- Annual results change based on allocation decisions.
- Annual review explains outcomes.
- Final ending changes for conservative, aggressive, concentrated-risk, learning-improvement, and cash-heavy strategies.
- Ending possibilities are not fewer than 10.
- Ending page shows full profit/loss statistics.
- Build and tests pass.
- Content audit finds no real stock names/tickers.
