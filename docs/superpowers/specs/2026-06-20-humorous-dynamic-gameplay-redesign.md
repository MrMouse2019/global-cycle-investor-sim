# Humorous Dynamic Gameplay Redesign

## Goal

Make the simulator feel less like a static teaching worksheet and more like a lively historical stock-market game: funny, competitive, reactive, and replayable, while preserving the current simulation boundary, desensitized asset names, local-only frontend architecture, and disclaimer rules.

## Positioning

The new product tone is:

- **Surface:** black humor, retail-investor satire, market gossip, NPC banter, and self-aware review text.
- **Core:** explainable annual simulation based on historical cycles, market fit, sector fit, stock selection, allocation concentration, events, trading losses, and risk control.
- **Boundary:** no real investment advice, no live market data, no tickers/logos, and no visible real stock names. Continue using desensitized stock-like names.

The game should attract players through humor and stimulation, but still give them a real-feeling buying/selling experience: choosing exposure, chasing themes, ignoring or following market noise, competing with peers, suffering drawdowns, and deciding whether to keep holding.

## Responsive UX Direction

### Desktop: Three-Tab Year Cockpit

Desktop uses a compact cockpit for each year.

Tabs:

1. **年度行情速览**
   - Default landing tab for the year.
   - Replace long macro paragraphs with short humorous cards.
   - Show policy, cycle, leading themes, lagging themes, and favorable markets/sectors as colorful tags.
   - Include a collapsed section: `展开完整历史背景`.
   - Historical event detail should open from event cards or modal-like panels instead of filling the main page.

2. **一键资产配置**
   - Three-column desktop layout.
   - Left: six strategy templates plus `延续去年配置`.
   - Middle: invested-ratio slider plus market and sector weights in one combined panel.
   - Right: filtered stock pool based on selected market and sector, requiring exactly three stocks when invested ratio is above zero.
   - Template clicks must fully populate invested ratio, market weights, sector weights, and a default market/sector focus.
   - The “must pick 3 stocks” rule should appear as a light floating bubble or compact inline hint, not a large warning block.

3. **年度结算 & 复盘**
   - Merge end assets, annual P/L, and return into a visual performance card.
   - Show a compact account curve for recent years.
   - Replace score explanations with sarcastic labels.
   - Make `进入下一年推演` the strongest button.
   - Make active exit buttons quiet, gray, and peripheral.
   - Use a playful retention line, such as “现在跑路可惜了，后面还有大牛市/史诗级熊市没体验到.”

### Mobile: Event-First Short Flow

Mobile should not squeeze the desktop cockpit into a narrow column. It should feel like a fast annual episode.

Sequence:

1. NPC or “反向财经大V” opens the year with a short market line.
2. Random event choice appears when applicable.
3. Player chooses a template, reuses last year, or quickly adjusts allocation.
4. Stock selection uses compact cards/carousel/list, still requiring exactly three stocks when invested.
5. Settlement shows one screen of return, rank pressure, annual roast, and the main next-year CTA.

The same store and domain engine should support both presentations.

## Dynamic Gameplay Systems

### 1. Random Event Decisions

Add an explicit decision system for events. These are not uncontrolled random returns; they are player choices that modify the annual simulation.

Event decision structure:

```ts
type EventDecision = {
  id: string
  eventId: string
  title: string
  prompt: string
  options: EventDecisionOption[]
}

type EventDecisionOption = {
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
```

Rules:

- Trigger a meaningful decision every 2-3 years.
- Trigger a high-impact black-swan decision every 3-5 years, aligned with existing historical crisis years.
- Each option should visibly affect expected return, volatility, trading loss, or later debuff.
- The player sees the choice text and roast, not a spreadsheet of formulas.
- The result summary should mention the chosen event and its consequence.

Examples:

- AI boom: follow the theme and accept `盲目追高`, or hold the original plan and risk near-term underperformance.
- Fed hike crisis: panic cut exposure, or buy the dip and accept larger short-term drawdown.
- Liquidity bull: chase brokerages/tech, or keep balanced and underperform the mania.

### 2. Mindset Debuffs

Add annual mindset states that change the next year’s behavior and make years feel different.

Debuff candidates:

- `膨胀梭哈`: after a large gain, concentrated exposure receives extra volatility and trading loss.
- `躺平麻木`: after a deep loss, switching into favored markets/sectors receives a mild return discount.
- `焦虑追涨`: after missing a strong market, positive gossip gives more upside but negative shocks hit harder.
- `死扛回本`: after consecutive loss years, lower turnover reduces trading loss but increases drawdown if wrong.
- `反向大V附体`: after following a bad NPC signal, next NPC signal should be distrusted or mocked in settlement.

Rules:

- Only one primary mindset debuff is active each year.
- It is derived from the previous result and recent history.
- It should be stored in game state and included in settlement/review.
- It modifies return or volatility within bounded ranges so the historical cycle remains dominant.

### 3. NPC and Rivalry System

Add lightweight social pressure without backend multiplayer.

NPC types:

- **沙雕股友:** comments at year start, big gains, big losses, black swans, and active exit prompts.
- **反向财经大V:** offers exaggerated bullish/bearish signal; player can `反驳` or `跟风`.
- **模拟对手:** pseudo-player benchmarks generated deterministically from local formulas.

Competitive hooks:

- Keep the current percentile ranking, but rename labels:
  - Top 10%: `周期收割者，完美避开各路资本套路`
  - Middle 50%: `标准反复被割散户，牛市喝汤熊市深套`
  - Bottom 10%: `天台常驻选手，教科书级踩坑合集`
- Add year-level pressure, such as `今年你跑赢了 63% 模拟玩家`.
- Add a rival baseline card: `隔壁老王今年靠日股防御少亏 12%，正在群里装死不说话`.
- Keep peer simulation deterministic and local.

### 4. Real Trading Feel

The allocation UI should feel like making real buy/sell decisions, without real tickers or advice.

Required details:

- Use `买入/卖出/加仓/减仓/持有` language where appropriate.
- Add `延续去年配置` to reduce repetitive work.
- Add `本次调仓幅度` and `交易损耗` feedback after allocation.
- Penalize high turnover and concentrated exposure over 60%.
- Show selected stock cards with one short meme-like description, not long industry logic.
- Preserve the player’s previous allocation in state so changes can be compared.
- Make the visual language closer to a stock trading page: quote-board rows, red/green return chips, mini trend bars/sparklines, market heat tags, and position-style selected stock panels.
- Each stock card should show estimated volatility, current year event exposure, and a compact `本年影响` label after settlement so players understand why different stock choices produced different results.

Trading loss rule:

- Compare current allocation to previous allocation.
- Penalize large changes across invested ratio, market weights, sector weights, and selected stocks.
- Add extra cost for a single market or sector over 60%.
- Costs should be visible in settlement as a roast, such as “一年换三次信仰，手续费先把你教育了一遍.”

### 5. Stock Price and Event Impact Feedback

Players must be able to feel that choosing different stocks matters. The app does not need live prices or real K-lines, but it should show a simulated stock-page experience.

Required UI:

- Allocation stock pool should look more like a market watchlist than generic cards.
- Each recommended stock row/card should show:
  - desensitized stock name
  - market and sector
  - expected style badge, such as `成长票`, `周期票`, `防御票`
  - simulated volatility chip
  - event exposure chip, such as `受益AI热`, `怕加息`, `资源逆风`
  - selected/unselected position state, such as `拟买入`, `持有`, `调出`
- Selected stocks should appear in a small “持仓篮子” panel with equal or simple display weights.
- Settlement should show per-selected-stock simulated annual return, not only basket average.
- The per-stock return line should decompose at least:
  - base stock profile
  - market cycle fit
  - sector cycle fit
  - event decision impact
  - stock-specific deterministic shock
- This breakdown can be visual and compact, but it must be inspectable enough that a player sees why one stock outperformed another.

Domain requirement:

- Extend `StockReturnBreakdown` to include per-stock return entries, not only basket-level average return.
- Event decisions and black-swan events must apply to stock returns when affected market or affected sector matches.
- The final annual return should continue to include the selected-stock contribution, so choosing three different stocks changes the year result.
- Determinism remains required: identical game state, allocation, scenario, and event decision must produce identical per-stock returns.

### 6. Dynamic UI

The interface should feel alive.

Desktop:

- Tabs show annual state badges: event pending, debuff active, settlement ready.
- Market/sector tags pulse subtly when they are in-favor or under pressure.
- Settlement performance card should visually distinguish gain/loss years.
- Black-swan years should use a high-contrast alert style, but not giant red warning walls.

Mobile:

- Use episode-like cards with sequential reveal.
- Event choice cards should feel prominent and tappable.
- Main CTA should remain fixed or easy to reach at the end of each step.

Implementation should avoid heavy animation libraries. Use CSS transitions and conditional classes.

## Content Direction

Rewrite visible macro and review text to be shorter and funnier.

Guidelines:

- Keep the historical situation recognizable.
- Avoid textbook lecture tone.
- Avoid in-app paragraphs that explain how to play.
- Use short cards, tags, roasts, and collapsed detail.
- Keep enough factual anchors for experienced players to recognize the market.
- Do not use real stock names, tickers, logos, or unique company facts in visible UI.

Example 2014 rewrite:

- Short card: `沪港通大门一开，资金排队冲进来，券商科技开香槟，资源股在角落怀疑人生。`
- Leading tags: `券商起飞`, `科技成长`, `低利率给估值打鸡血`
- Lagging tags: `资源被嫌弃`, `农业没人理`
- Collapsed detail keeps the original historical explanation.

Review examples:

- `明明科技主线行情，你分散一堆冷门板块，白白少赚十几个点！`
- `半清醒散户，总算没一把梭哈全仓单赛道。`
- `你这不是分散投资，是把每个坑都浅浅踩了一脚。`

## Data and Domain Changes

Extend types in `src/domain/types/game.ts`:

- `MindsetDebuff`
- `EventDecision`
- `EventDecisionOption`
- `NpcMessage`
- `RivalSnapshot`
- `TradeCostBreakdown`
- `YearInteractionState`

Extend `GameState`:

- `previousAllocation?: Allocation`
- `activeMindset?: MindsetDebuff`
- `pendingDecision?: EventDecision`
- `decisionHistory: EventDecisionResult[]`
- `npcMessages: NpcMessage[]`

Extend `Allocation` or yearly input:

- `followedNpcSignal?: boolean`
- `eventDecisionOptionId?: string`

Extend `YearResult`:

- `eventDecisionResult?: EventDecisionResult`
- `mindsetEffect?: MindsetEffect`
- `tradeCost: TradeCostBreakdown`
- `rivalSnapshot: RivalSnapshot`
- `roastLines: string[]`

Pure domain functions:

- `selectYearDecision(game, scenario)`
- `resolveEventDecision(decision, optionId)`
- `deriveMindsetDebuff(game)`
- `calculateTradeCost(previousAllocation, currentAllocation)`
- `calculateRivalSnapshot(game, result)`
- `buildNpcMessages(game, scenario, result?)`
- `buildHumorousReviewItems(...)`

## State Flow

Current flow can stay close to:

`briefing -> allocating -> settling -> reviewing -> next year`

But the UI should present it differently:

- Desktop can show briefing/allocation/settlement as tabs within the annual cockpit.
- Mobile can show them as event-first sequential steps.
- Submitting allocation still remains the authoritative point where `simulateYear` runs.
- Event decisions must be resolved before annual simulation if one is pending.
- `advanceYear` should derive the next mindset/debuff and next pending event decision.

## Testing Requirements

Add focused unit tests before implementation:

- Event decisions apply return/volatility modifiers only to affected exposures.
- Black-swan decision years remain within the required 3-5 year crisis cadence.
- Mindset debuff is derived from prior gain/loss/underperformance history.
- Trade cost increases with allocation turnover and concentration over 60%.
- Reusing last year’s allocation results in lower turnover cost than changing all weights.
- Rival percentile and labels map to top/middle/bottom player bands.
- Simulation remains deterministic for identical game state, scenario, allocation, and event choice.
- Allocation validation still enforces exactly three selected stocks when invested.

UI/component tests should cover:

- Desktop cockpit renders three tabs.
- Mobile event-first layout renders the event step first.
- Template click fills invested ratio, market weights, sector weights, and focus selections.
- `延续去年配置` restores previous allocation when available.

## Non-Goals

- No backend leaderboard.
- No real market data.
- No real ticker or logo display.
- No unbounded randomness.
- No heavy charting or animation dependency unless later justified.
- No complete rewrite of the app shell if existing state and page boundaries can be evolved safely.

## Acceptance Criteria

- Desktop default experience is the three-tab annual cockpit.
- Mobile experience is event-first and does not feel like a squeezed desktop table.
- Long macro copy is hidden behind collapsible details.
- Annual years differ through events, debuffs, NPC comments, peer/rival pressure, simulated stock-board movement, and market state badges.
- Player has a stronger buy/sell feeling through templates, reuse, filtered stock selection, turnover feedback, and trade costs.
- Simulation results remain explainable from cycle, market/sector allocation, per-stock return breakdowns, event decisions, debuffs, trade costs, and concentration.
- Existing `pnpm test`, `pnpm lint`, and `pnpm build` pass.
