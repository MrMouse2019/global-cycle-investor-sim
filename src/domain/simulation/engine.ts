import { LIQUIDATION_RATIO } from '../../shared/constants/app'
import { events, heavyBlackSwanEvents } from '../../data/events/events'
import { markets } from '../../data/markets/markets'
import { sectors } from '../../data/sectors/sectors'
import { endings } from '../../data/endings/endings'
import { recommendStocks as getRecommendedStocks, stockPool } from '../../data/stocks/stockPool'
import type {
  Allocation,
  Ending,
  EventCard,
  GameState,
  ExitInfo,
  ExitPrompt,
  GameStatistics,
  MarketId,
  PlayerPercentile,
  PlayerHabitFlags,
  PlayerScores,
  ReviewItem,
  SectorId,
  StockRecommendationInput,
  StockReturnBreakdown,
  YearResult,
  YearScenario,
} from '../types/game'

type WeightedScore = {
  fit: number
  warning: number
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const roundMoney = (value: number) => Math.round(value)
const roundRate = (value: number) => Math.round(value * 10_000) / 10_000
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

export function getDisplayYearLabel(game: GameState) {
  return game.totalYears ? `第 ${game.currentYear} / ${game.totalYears} 年` : `第 ${game.currentYear} 年`
}

export function recommendStocks(input: StockRecommendationInput) {
  return getRecommendedStocks(input)
}

export function getHeavyBlackSwanEventsForYear(year: number): EventCard[] {
  if (year < 3) return []

  let cursor = 3
  let eventIndex = 0
  while (cursor <= year && eventIndex < heavyBlackSwanEvents.length) {
    if (cursor === year) return [heavyBlackSwanEvents[eventIndex]]
    cursor += 3 + (eventIndex % 3)
    eventIndex += 1
  }

  return []
}

function createExitSnapshot(game: GameState, result?: YearResult) {
  const totalAssets = result?.endAssets ?? game.totalAssets
  const cash = result ? Math.round(result.endAssets * (1 - result.allocation.investedRatio)) : game.cash
  const peakAssets = Math.max(game.peakAssets, result?.startAssets ?? 0, result?.endAssets ?? 0)
  const resultDrawdown = result && peakAssets > 0 ? (peakAssets - result.endAssets) / peakAssets : 0
  return {
    year: result?.year ?? game.currentYear,
    totalAssets,
    cash,
    totalReturn: roundRate((totalAssets - game.initialCapital) / game.initialCapital),
    maxDrawdown: roundRate(Math.max(game.maxDrawdown, result?.drawdown ?? 0, resultDrawdown)),
    annualReturn: result?.annualReturn ?? 0,
    profitLoss: result?.profitLoss ?? 0,
  }
}

function createExitInfo(params: {
  game: GameState
  result?: YearResult
  type: ExitInfo['type']
  trigger: ExitInfo['trigger']
  reason: string
}): ExitInfo {
  return {
    type: params.type,
    trigger: params.trigger,
    reason: params.reason,
    snapshot: createExitSnapshot(params.game, params.result),
  }
}

export function shouldShowExitPrompt(game: GameState, result: YearResult): ExitPrompt | undefined {
  if (result.liquidation.liquidated || game.exitPromptDismissedYear === result.year) return undefined

  const snapshot = createExitSnapshot(game, result)
  const totalReturn = snapshot.totalReturn
  const maxDrawdown = Math.max(game.maxDrawdown, result.drawdown, snapshot.maxDrawdown)

  if (maxDrawdown > 0.5) {
    return {
      trigger: 'drawdown',
      message: '账户最大回撤已超过 50%。这是长期投资中的重大风险信号，要结束投资还是继续承受波动？',
      snapshot: { ...snapshot, maxDrawdown: roundRate(maxDrawdown) },
    }
  }

  if (totalReturn > 0.5) {
    return {
      trigger: 'profit',
      message: '账户累计收益率已超过 50%。你已经获得阶段性成果，要止盈结束还是继续投资？',
      snapshot,
    }
  }

  return undefined
}

export function createActiveExitInfo(game: GameState, reason: string, trigger: ExitInfo['trigger']): ExitInfo {
  return createExitInfo({ game, result: game.lastResult, type: 'active', trigger, reason })
}

export function normalizeWeights<T extends string>(weights: Record<T, number>): Record<T, number> {
  const total = sum(Object.values(weights))
  if (total <= 0) return weights
  return Object.fromEntries(
    Object.entries(weights).map(([key, value]) => [key, Number(value) / total]),
  ) as Record<T, number>
}

export function validateAllocation(allocation: Allocation): string[] {
  const errors: string[] = []
  const marketTotal = sum(Object.values(allocation.marketWeights))
  const sectorTotal = sum(Object.values(allocation.sectorWeights))

  if (allocation.investedRatio < 0 || allocation.investedRatio > 2) {
    errors.push('仓位必须在 0% 到 200% 之间。')
  }
  if (Math.abs(marketTotal - 1) > 0.01) {
    errors.push('市场权重合计需要接近 100%。')
  }
  if (Math.abs(sectorTotal - 1) > 0.01) {
    errors.push('板块权重合计需要接近 100%。')
  }
  if (allocation.investedRatio > 0 && (allocation.selectedStocks?.length ?? 0) !== 3) {
    errors.push('非现金配置必须选择 3 只重仓股票。')
  }

  return errors
}

function weightedFit<T extends string>(
  weights: Record<T, number>,
  preferred: T[],
  warnings: T[] = [],
): WeightedScore {
  const normalized = normalizeWeights(weights)
  return {
    fit: sum(preferred.map((id) => normalized[id] ?? 0)),
    warning: sum(warnings.map((id) => normalized[id] ?? 0)),
  }
}

export function scoreMarketFit(allocation: Allocation, scenario: YearScenario) {
  return weightedFit<MarketId>(allocation.marketWeights, scenario.preferredMarkets)
}

export function scoreSectorFit(allocation: Allocation, scenario: YearScenario) {
  return weightedFit<SectorId>(
    allocation.sectorWeights,
    scenario.preferredSectors,
    scenario.warningSectors,
  )
}

function calculateConcentration(allocation: Allocation) {
  const maxMarket = Math.max(...Object.values(allocation.marketWeights))
  const maxSector = Math.max(...Object.values(allocation.sectorWeights))
  const concentration = Math.max(maxMarket, maxSector)
  return { maxMarket, maxSector, concentration }
}

function calculateAverageVolatility(allocation: Allocation) {
  const marketVolatility = sum(
    markets.map((market) => allocation.marketWeights[market.id] * market.baseVolatility),
  )
  const sectorVolatility = sum(
    sectors.map((sector) => allocation.sectorWeights[sector.id] * sector.volatility),
  )
  return (marketVolatility + sectorVolatility) / 2
}

function calculateEventContribution(allocation: Allocation, appliedEvents: EventCard[]) {
  return appliedEvents.reduce((total, event) => {
    const marketExposure = event.affectedMarkets?.length
      ? sum(event.affectedMarkets.map((id) => allocation.marketWeights[id] ?? 0))
      : 0.45
    const sectorExposure = event.affectedSectors?.length
      ? sum(event.affectedSectors.map((id) => allocation.sectorWeights[id] ?? 0))
      : 0.45
    const exposure = Math.max(marketExposure, sectorExposure)
    return total + event.returnImpact * exposure
  }, 0)
}

function calculateEventVolatility(allocation: Allocation, appliedEvents: EventCard[]) {
  return appliedEvents.reduce((total, event) => {
    const marketExposure = event.affectedMarkets?.length
      ? sum(event.affectedMarkets.map((id) => allocation.marketWeights[id] ?? 0))
      : 0.45
    const sectorExposure = event.affectedSectors?.length
      ? sum(event.affectedSectors.map((id) => allocation.sectorWeights[id] ?? 0))
      : 0.45
    return total + event.volatilityImpact * Math.max(marketExposure, sectorExposure)
  }, 0)
}

function deterministicLuck(year: number) {
  const wave = Math.sin(year * 12.9898) * 43758.5453
  return (wave - Math.floor(wave) - 0.5) * 0.018
}

function deterministicStockShock(stockId: string, year: number) {
  const seed = [...stockId].reduce((total, char, index) => total + char.charCodeAt(0) * (index + 11), year * 97)
  const firstWave = Math.sin(seed * 12.9898) * 43758.5453
  const secondWave = Math.sin((seed + year) * 78.233) * 19341.17
  return (firstWave - Math.floor(firstWave) - 0.5) * 2 + (secondWave - Math.floor(secondWave) - 0.5)
}

function calculateStockReturn(params: {
  allocation: Allocation
  scenario: YearScenario
  appliedEvents: EventCard[]
}): StockReturnBreakdown {
  const selectedStocks = (params.allocation.selectedStocks ?? [])
    .map((stockId) => stockPool.find((stock) => stock.id === stockId))
    .filter((stock): stock is NonNullable<typeof stock> => Boolean(stock))

  if (params.allocation.investedRatio <= 0 || selectedStocks.length === 0) {
    return {
      selectedStocks: [],
      contribution: 0,
      averageReturn: 0,
      averageVolatility: 0,
    }
  }

  const stockReturns = selectedStocks.map((stock) => {
    const marketCycleBonus = params.scenario.preferredMarkets.includes(stock.marketId) ? 0.035 : -0.012
    const sectorCycleBonus = params.scenario.preferredSectors.includes(stock.sectorId) ? 0.045 : 0
    const warningPenalty = params.scenario.warningSectors.includes(stock.sectorId) ? -0.06 : 0
    const eventImpact = params.appliedEvents.reduce((total, event) => {
      const affectedMarket = event.affectedMarkets?.includes(stock.marketId)
      const affectedSector = event.affectedSectors?.includes(stock.sectorId)
      return total + (affectedMarket || affectedSector ? event.returnImpact * 0.72 : 0)
    }, 0)
    const stockSpecificShock = deterministicStockShock(stock.id, params.scenario.year) * stock.volatility * 0.45
    return clamp(
      stock.expectedReturn + marketCycleBonus + sectorCycleBonus + warningPenalty + eventImpact + stockSpecificShock,
      -0.55,
      0.68,
    )
  })

  const averageReturn = roundRate(sum(stockReturns) / stockReturns.length)
  const averageVolatility = roundRate(sum(selectedStocks.map((stock) => stock.volatility)) / selectedStocks.length)
  return {
    selectedStocks,
    averageReturn,
    averageVolatility,
    contribution: roundRate(averageReturn * 0.32),
  }
}

function buildReviewItems(params: {
  marketFit: WeightedScore
  sectorFit: WeightedScore
  allocation: Allocation
  drawdown: number
  appliedEvents: EventCard[]
  liquidated: boolean
  stockResult: StockReturnBreakdown
}): ReviewItem[] {
  const { marketFit, sectorFit, allocation, drawdown, appliedEvents, liquidated, stockResult } = params
  const items: ReviewItem[] = []

  if (marketFit.fit >= 0.45) {
    items.push({ type: 'good', title: '市场选择匹配周期', text: '你把较多仓位放在本年更适配的市场，说明已经开始先看宏观 β。' })
  } else {
    items.push({ type: 'warning', title: '市场选择偏离周期', text: '本年市场配置与宏观环境匹配度不高，收益更多依赖运气而不是体系。' })
  }

  if (sectorFit.fit >= 0.42 && sectorFit.warning <= 0.25) {
    items.push({ type: 'good', title: '板块景气判断较好', text: '你的板块配置避开了主要逆风方向，并抓住了本年景气线索。' })
  } else if (sectorFit.warning > 0.35) {
    items.push({ type: 'warning', title: '逆风板块暴露过高', text: '你在本年承压板块上暴露过多，说明还不能把行业轮动和周期联系起来。' })
  } else {
    items.push({ type: 'lesson', title: '板块配置仍可优化', text: '板块没有明显踩坑，但也没有充分利用本年最顺风的方向。' })
  }

  if (allocation.investedRatio > 0.92 || drawdown > 0.32) {
    items.push({ type: 'warning', title: '风控压力偏高', text: '高仓位或高回撤会侵蚀长期复利。长期投资不是每年都要满仓冲刺。' })
  } else if (allocation.investedRatio < 0.3) {
    items.push({ type: 'lesson', title: '现金保护了你，也限制了你', text: '低仓位能降低波动，但长期过度空仓会错过周期红利。' })
  } else {
    items.push({ type: 'good', title: '仓位相对均衡', text: '你保留了参与市场的能力，同时没有把组合暴露在单一年份的极端风险中。' })
  }

  appliedEvents.forEach((event) => {
    items.push({ type: 'lesson', title: event.title, text: event.reviewText })
  })

  if (stockResult.selectedStocks.length > 0) {
    items.push({
      type: stockResult.contribution >= 0 ? 'good' : 'warning',
      title: '重仓股票影响组合收益',
      text: `本年重仓 ${stockResult.selectedStocks.map((stock) => stock.name).join('、')}，股票篮子收益约 ${Math.round(stockResult.averageReturn * 1000) / 10}%，对组合贡献约 ${Math.round(stockResult.contribution * 1000) / 10} 个百分点。`,
    })
  }

  if (liquidated) {
    items.push({ type: 'warning', title: '提前清仓不是单年失败', text: '清仓来自资产损失、回撤和风险暴露的累积，核心问题是组合没有留下修正空间。' })
  }

  return items.slice(0, 5)
}

function updateFlags(
  previousFlags: PlayerHabitFlags,
  allocation: Allocation,
  annualReturn: number,
  drawdown: number,
  scenario: YearScenario,
  appliedEvents: EventCard[],
) {
  const { maxMarket, maxSector } = calculateConcentration(allocation)
  const concentrated = maxMarket >= 0.55 || maxSector >= 0.55
  const inverseCycle =
    scoreMarketFit(allocation, scenario).fit < 0.25 || scoreSectorFit(allocation, scenario).warning > 0.35
  const riskEventExposure =
    appliedEvents.some((event) => event.type === 'risk') &&
    allocation.investedRatio > 0.85 &&
    concentrated &&
    drawdown > 0.22

  return {
    allInYears: previousFlags.allInYears + (allocation.investedRatio >= 0.94 ? 1 : 0),
    concentratedYears: previousFlags.concentratedYears + (concentrated ? 1 : 0),
    cashHeavyYears: previousFlags.cashHeavyYears + (allocation.investedRatio <= 0.3 ? 1 : 0),
    inverseCycleYears: previousFlags.inverseCycleYears + (inverseCycle && annualReturn < 0 ? 1 : 0),
    highRiskEventExposureYears:
      previousFlags.highRiskEventExposureYears + (riskEventExposure ? 1 : 0),
  }
}

function checkLiquidation(params: {
  endAssets: number
  initialCapital: number
  maxDrawdown: number
  riskControl: number
  flags: PlayerHabitFlags
  cumulativeReturn: number
}) {
  const { endAssets, initialCapital, maxDrawdown, riskControl, flags, cumulativeReturn } = params
  if (endAssets <= 0) {
    return { liquidated: true, reason: '高杠杆/借贷或仓位控制不当导致现金全部亏损，被动退出游戏。' }
  }
  if (endAssets <= initialCapital * LIQUIDATION_RATIO) {
    return { liquidated: true, reason: '总资产跌破初始本金的 30% 清仓线。' }
  }
  if (maxDrawdown >= 0.7 && riskControl < 30) {
    return { liquidated: true, reason: '最大回撤超过 70%，且风控评分低于 30。' }
  }
  if (flags.allInYears >= 3 && flags.concentratedYears >= 3 && cumulativeReturn <= -0.5) {
    return { liquidated: true, reason: '连续多年高仓位集中押注，并累计亏损超过 50%。' }
  }
  if (flags.highRiskEventExposureYears >= 2 && riskControl < 35) {
    return { liquidated: true, reason: '多次在风险事件中缺少分散和现金缓冲，触发风险失控清仓。' }
  }
  return { liquidated: false }
}

export function simulateYear(
  game: GameState,
  scenario: YearScenario,
  allocationInput: Allocation,
): YearResult {
  const allocation: Allocation = {
    ...allocationInput,
    investedRatio: clamp(allocationInput.investedRatio, 0, 2),
    marketWeights: normalizeWeights(allocationInput.marketWeights),
    sectorWeights: normalizeWeights(allocationInput.sectorWeights),
  }
  const marketFit = scoreMarketFit(allocation, scenario)
  const sectorFit = scoreSectorFit(allocation, scenario)
  const scheduledBlackSwanEvents = getHeavyBlackSwanEventsForYear(scenario.year)
  const appliedEvents = [
    ...scenario.eventIds
    .map((eventId) => events.find((event) => event.id === eventId))
      .filter((event): event is EventCard => Boolean(event)),
    ...scheduledBlackSwanEvents,
  ]

  const policyContribution =
    scenario.policy === 'loose' ? 0.018 : scenario.policy === 'tight' ? -0.022 : 0.004
  const riskPreferenceContribution =
    scenario.riskPreference === 'high' ? 0.012 : scenario.riskPreference === 'low' ? -0.006 : 0.002
  const marketContribution = (marketFit.fit - 0.32) * 0.22
  const sectorContribution = (sectorFit.fit - sectorFit.warning * 0.8 - 0.28) * 0.26
  const concentration = calculateConcentration(allocation)
  const diversificationAdjustment = concentration.concentration > 0.55 ? -0.028 : 0.012
  const eventContribution = calculateEventContribution(allocation, appliedEvents)
  const stockResult = calculateStockReturn({ allocation, scenario, appliedEvents })
  const leverageRatio = Math.max(0, allocation.investedRatio - 1)
  const leveragePenalty = leverageRatio * 0.12
  const rawReturn =
    marketContribution +
    sectorContribution +
    policyContribution +
    riskPreferenceContribution +
    diversificationAdjustment +
    eventContribution +
    stockResult.contribution +
    deterministicLuck(scenario.year)
  let annualReturn = roundRate(clamp(rawReturn * allocation.investedRatio - leveragePenalty, -1.1, 0.75))

  const volatility = calculateAverageVolatility(allocation) + calculateEventVolatility(allocation, appliedEvents) + stockResult.averageVolatility * 0.18
  const drawdown = roundRate(
    clamp(
      allocation.investedRatio * (volatility + Math.max(0, -annualReturn) * 0.75) +
        (concentration.concentration > 0.55 ? 0.08 : 0),
      0.02,
      0.82,
    ),
  )
  const startAssets = game.totalAssets
  if (allocation.investedRatio > 1 && rawReturn < 0) {
    annualReturn = -1
  }
  const profitLoss = roundMoney(startAssets * annualReturn)
  const endAssets = Math.max(0, roundMoney(startAssets + profitLoss))
  const scoreDelta: PlayerScores = {
    marketCognition: Math.round((marketFit.fit - 0.35) * 22),
    sectorSensitivity: Math.round((sectorFit.fit - sectorFit.warning - 0.28) * 24),
    riskControl: Math.round((0.65 - concentration.concentration) * 18 + (0.72 - allocation.investedRatio) * 12 - drawdown * 30),
  }
  const endingScores: PlayerScores = {
    marketCognition: clamp(game.scores.marketCognition + scoreDelta.marketCognition, 0, 100),
    sectorSensitivity: clamp(game.scores.sectorSensitivity + scoreDelta.sectorSensitivity, 0, 100),
    riskControl: clamp(game.scores.riskControl + scoreDelta.riskControl, 0, 100),
  }
  const peakAssets = Math.max(game.peakAssets, startAssets, endAssets)
  const maxDrawdown = Math.max(game.maxDrawdown, (peakAssets - endAssets) / peakAssets, drawdown)
  const updatedFlags = updateFlags(
    game.flags,
    allocation,
    annualReturn,
    drawdown,
    scenario,
    appliedEvents,
  )
  const liquidation = checkLiquidation({
    endAssets,
    initialCapital: game.initialCapital,
    maxDrawdown,
    riskControl: endingScores.riskControl,
    flags: updatedFlags,
    cumulativeReturn: (endAssets - game.initialCapital) / game.initialCapital,
  })

  return {
    year: scenario.year,
    scenario,
    allocation,
    annualReturn,
    profitLoss,
    drawdown,
    stockResult,
    startAssets,
    endAssets,
    scoreDelta,
    endingScores,
    appliedEvents,
    reviewItems: buildReviewItems({
      marketFit,
      sectorFit,
      allocation,
      drawdown,
      appliedEvents,
      liquidated: liquidation.liquidated,
      stockResult,
    }),
    liquidation,
  }
}

export function applyYearResult(game: GameState, result: YearResult): GameState {
  const peakAssets = Math.max(game.peakAssets, result.startAssets, result.endAssets)
  const maxDrawdown = Math.max(game.maxDrawdown, (peakAssets - result.endAssets) / peakAssets, result.drawdown)
  const flags = updateFlags(
    game.flags,
    result.allocation,
    result.annualReturn,
    result.drawdown,
    result.scenario,
    result.appliedEvents,
  )
  const nextGame = {
    ...game,
    status: 'settling' as const,
    totalAssets: result.endAssets,
    cash: Math.round(result.endAssets * (1 - result.allocation.investedRatio)),
    peakAssets,
    maxDrawdown,
    scores: result.endingScores,
    history: [...game.history, result],
    flags,
    lastResult: result,
    liquidationReason: result.liquidation.reason,
  }

  const passiveExit = result.liquidation.liquidated
    ? createExitInfo({
        game: nextGame,
        result,
        type: 'passive',
        trigger: result.endAssets <= 0 ? 'cash-wipeout' : 'liquidation',
        reason: result.liquidation.reason ?? '仓位控制不当触发被动退出。',
      })
    : undefined

  return {
    ...nextGame,
    exitInfo: passiveExit,
    exitPrompt: passiveExit ? undefined : shouldShowExitPrompt(nextGame, result),
  }
}

export function calculateStatistics(game: GameState): GameStatistics {
  const returns = game.history.map((result) => result.annualReturn)
  const profitReturns = returns.filter((value) => value > 0)
  const lossReturns = returns.filter((value) => value < 0)
  const completedYears = game.history.length
  const finalAssets = game.totalAssets
  const totalReturn = (finalAssets - game.initialCapital) / game.initialCapital
  return {
    initialCapital: game.initialCapital,
    finalAssets,
    totalProfitLoss: finalAssets - game.initialCapital,
    totalReturn: roundRate(totalReturn),
    annualizedReturn: completedYears > 0 ? roundRate((finalAssets / game.initialCapital) ** (1 / completedYears) - 1) : 0,
    completedYears,
    profitYears: profitReturns.length,
    lossYears: lossReturns.length,
    bestYearReturn: returns.length ? Math.max(...returns) : 0,
    worstYearReturn: returns.length ? Math.min(...returns) : 0,
    averageProfitYearReturn: profitReturns.length ? roundRate(sum(profitReturns) / profitReturns.length) : 0,
    averageLossYearReturn: lossReturns.length ? roundRate(sum(lossReturns) / lossReturns.length) : 0,
    maxDrawdown: roundRate(game.maxDrawdown),
    earlyEnded: Boolean(game.exitInfo ?? game.liquidationReason),
    earlyEndReason: game.exitInfo?.reason ?? game.liquidationReason,
    exitType: game.exitInfo?.type,
    exitTrigger: game.exitInfo?.trigger,
    exitSnapshot: game.exitInfo?.snapshot,
  }
}

function simulatedPeerScore(index: number) {
  const cycle = Math.sin(index * 12.9898) * 43758.5453
  const volatility = Math.sin((index + 17) * 78.233) * 19341.17
  const normalizedCycle = cycle - Math.floor(cycle)
  const normalizedVolatility = volatility - Math.floor(volatility)
  return -0.58 + normalizedCycle * 1.72 - normalizedVolatility * 0.34
}

export function calculatePlayerPercentile(game: GameState): PlayerPercentile {
  const peerCount = 10_000
  const totalReturn = (game.totalAssets - game.initialCapital) / game.initialCapital
  const completedYears = Math.max(1, game.history.length || game.currentYear - 1)
  const annualizedReturn = (game.totalAssets / game.initialCapital) ** (1 / completedYears) - 1
  const score = roundRate(totalReturn * 0.72 + annualizedReturn * 1.6 - game.maxDrawdown * 0.28)
  let beatenPeers = 0

  for (let index = 0; index < peerCount; index += 1) {
    if (score >= simulatedPeerScore(index)) beatenPeers += 1
  }

  const percentile = clamp(Math.round((beatenPeers / peerCount) * 100), 1, 99)
  const topPercent = clamp(100 - percentile + 1, 1, 100)
  const label =
    topPercent <= 5
      ? '顶尖梯队'
      : topPercent <= 20
        ? '领先玩家'
        : topPercent <= 50
          ? '中上水平'
          : '仍在追赶'
  const description =
    topPercent <= 20
      ? '你的账户收益和回撤控制已经跑赢多数模拟玩家。'
      : topPercent <= 50
        ? '你的表现接近全服中位以上，继续优化周期和仓位匹配。'
        : '当前收益分位偏后，优先降低黑天鹅年份的集中暴露。'

  return {
    topPercent,
    percentile,
    peerCount,
    score,
    label,
    description,
  }
}

const endingById = (id: string) => endings.find((ending) => ending.id === id) ?? endings[6]

export function selectEnding(game: GameState): Ending {
  const stats = calculateStatistics(game)
  const { scores, flags } = game

  if (game.exitInfo?.trigger === 'cash-wipeout' || game.exitInfo?.trigger === 'liquidation') {
    return game.exitInfo.reason.includes('风险事件')
      ? endingById('risk-event-liquidated')
      : endingById('all-in-liquidated')
  }
  if (game.exitInfo?.type === 'active' && game.exitInfo.snapshot.totalReturn >= 0.5) {
    return endingById('steady-compounder')
  }
  if (game.exitInfo?.type === 'active' && game.exitInfo.snapshot.totalReturn < 0) {
    return endingById('learning-investor')
  }
  if (game.liquidationReason?.includes('风险事件')) return endingById('risk-event-liquidated')
  if (game.liquidationReason) return endingById('all-in-liquidated')
  if (flags.cashHeavyYears >= Math.ceil(stats.completedYears * 0.65)) return endingById('cash-king')
  if (stats.totalReturn >= 1.2 && scores.marketCognition >= 85 && scores.riskControl >= 80) {
    return endingById('cycle-master')
  }
  if (stats.totalReturn >= 0.75 && scores.marketCognition >= 75 && flags.concentratedYears <= 5) {
    return endingById('global-allocator')
  }
  if (stats.totalReturn >= 0.5 && scores.riskControl >= 70 && stats.maxDrawdown < 0.45) {
    return endingById('steady-compounder')
  }
  if (stats.totalReturn >= 0.7 && stats.maxDrawdown >= 0.45) return endingById('growth-winner')
  if (scores.sectorSensitivity >= 82 && stats.totalReturn > 0.25) return endingById('sector-rotator')
  if (stats.totalReturn > 0 && flags.inverseCycleYears >= 4 && scores.riskControl < 50) {
    return endingById('lucky-winner')
  }
  if (stats.completedYears >= 12 && game.history.slice(-6).filter((result) => result.annualReturn > 0).length >= 4) {
    return endingById('learning-investor')
  }
  if (stats.totalReturn > 0.25 && stats.maxDrawdown >= 0.58) return endingById('drawdown-bearer')
  if (stats.totalReturn <= -0.3 && flags.inverseCycleYears >= 4) return endingById('inverse-cycle-loser')
  if (stats.totalReturn <= -0.3) return endingById('cycle-leek')
  return endingById('market-follower')
}
