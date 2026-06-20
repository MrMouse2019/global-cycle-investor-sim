import { describe, expect, it } from 'vitest'
import { scenarios } from '../../src/data/cycles/scenarios'
import { endings } from '../../src/data/endings/endings'
import { stockPool } from '../../src/data/stocks/stockPool'
import { allocationTemplates } from '../../src/domain/simulation/allocationTemplates'
import {
  applyYearResult,
  calculatePlayerPercentile,
  calculateStatistics,
  createActiveExitInfo,
  getDisplayYearLabel,
  getHeavyBlackSwanEventsForYear,
  recommendStocks,
  scoreMarketFit,
  scoreSectorFit,
  shouldShowExitPrompt,
  selectEnding,
  simulateYear,
  validateAllocation,
} from '../../src/domain/simulation/engine'
import { createInitialGame } from '../../src/features/campaign-flow/gameStore'

const badConcentrated = {
  ...allocationTemplates.growth,
  investedRatio: 1,
  marketWeights: { 'a-share': 0, 'h-share': 0, us: 1, japan: 0, taiwan: 0, korea: 0 },
  sectorWeights: {
    consumer: 0,
    technology: 1,
    healthcare: 0,
    'new-energy': 0,
    metals: 0,
    financials: 0,
    defense: 0,
    agriculture: 0,
  },
}

const leveragedWipeout = {
  ...badConcentrated,
  investedRatio: 2,
}

describe('simulation engine', () => {
  it('validates allocation totals', () => {
    expect(validateAllocation(allocationTemplates.steady)).toContain('非现金配置必须选择 3 只重仓股票。')
    expect(validateAllocation({ ...allocationTemplates.steady, investedRatio: 2.2 })).toContain(
      '仓位必须在 0% 到 200% 之间。',
    )
    expect(validateAllocation(allocationTemplates.growth)).toContain('非现金配置必须选择 3 只重仓股票。')
    expect(validateAllocation(allocationTemplates.cash)).toEqual([])
  })

  it('scores market and sector fit', () => {
    const scenario = scenarios.find((item) => item.historicalYear === 2023)!
    expect(scoreMarketFit(allocationTemplates.growth, scenario).fit).toBeGreaterThan(0.4)
    expect(scoreSectorFit(allocationTemplates.growth, scenario).fit).toBeGreaterThan(0.45)
  })

  it('uses unlimited years by default while preserving fixed year labels', () => {
    const unlimited = createInitialGame()
    expect(unlimited.totalYears).toBeNull()
    expect(getDisplayYearLabel(unlimited)).toBe('第 1 年')

    const fixed = createInitialGame({ totalYears: 20 })
    expect(fixed.totalYears).toBe(20)
    expect(getDisplayYearLabel(fixed)).toBe('第 1 / 20 年')
  })

  it('builds a 100-stock pool across markets and sectors', () => {
    expect(stockPool).toHaveLength(100)
    expect(stockPool.some((stock) => stock.marketId === 'us' && stock.sectorId === 'technology')).toBe(true)
    expect(stockPool.some((stock) => stock.marketId === 'a-share' && stock.sectorId === 'consumer')).toBe(true)
    expect(new Set(stockPool.map((stock) => stock.id)).size).toBe(stockPool.length)
  })

  it('recommends six stocks that match selected market and sector preferences', () => {
    const recommendations = recommendStocks({
      year: 2,
      marketId: 'us',
      sectorId: 'technology',
      scenario: scenarios[1],
    })

    expect(recommendations).toHaveLength(6)
    expect(recommendations.slice(0, 3).map((stock) => stock.name)).toEqual(
      expect.arrayContaining(['英伟达', '苹果', '微软']),
    )
    expect(recommendations.every((stock) => stock.marketId === 'us' || stock.sectorId === 'technology')).toBe(true)
  })

  it('adds selected heavy stock return to annual settlement', () => {
    const game = createInitialGame()
    const recommendation = recommendStocks({
      year: 2,
      marketId: 'us',
      sectorId: 'technology',
      scenario: scenarios[1],
    })
    const allocation = {
      ...allocationTemplates.growth,
      selectedStocks: recommendation.slice(0, 3).map((stock) => stock.id),
    }
    const withoutStocks = simulateYear(game, scenarios[1], allocationTemplates.growth)
    const withStocks = simulateYear(game, scenarios[1], allocation)

    expect(withStocks.stockResult.selectedStocks).toHaveLength(3)
    expect(withStocks.stockResult.contribution).not.toBe(0)
    expect(withStocks.annualReturn).not.toBe(withoutStocks.annualReturn)
  })

  it('schedules heavyweight black swan events every three to five years without repetition', () => {
    const triggeredYears = Array.from({ length: scenarios.length }, (_, index) => index + 1).filter(
      (year) => getHeavyBlackSwanEventsForYear(year).length > 0,
    )
    const triggeredIds = triggeredYears.flatMap((year) => getHeavyBlackSwanEventsForYear(year).map((event) => event.id))

    expect(triggeredYears).toEqual([4, 7, 11, 14, 15, 16, 18])
    expect(triggeredYears.map((year) => scenarios[year - 1].historicalYear)).toEqual([2008, 2011, 2015, 2018, 2019, 2020, 2022])
    expect(new Set(triggeredIds).size).toBe(triggeredIds.length)
    expect(getHeavyBlackSwanEventsForYear(4).every((event) => event.returnImpact <= -0.1)).toBe(true)
  })

  it('heavyweight black swans materially suppress exposed asset returns and raise volatility', () => {
    const scenario = scenarios.find((item) => item.historicalYear === 2008)!
    const game = createInitialGame()
    const baseline = simulateYear(game, { ...scenarios[2], eventIds: [] }, badConcentrated)
    const shocked = simulateYear(game, scenario, badConcentrated)

    expect(shocked.appliedEvents.some((event) => event.type === 'black-swan')).toBe(true)
    expect(shocked.annualReturn).toBeLessThanOrEqual(baseline.annualReturn - 0.06)
    expect(shocked.drawdown).toBeGreaterThan(baseline.drawdown)
    expect(shocked.reviewItems.some((item) => item.title.includes('黑天鹅'))).toBe(true)
  })

  it('rewards defensive positioning in recession more than concentrated growth', () => {
    const recession = scenarios.find((scenario) => scenario.macroCycle === 'recession')!
    const game = createInitialGame()
    const defensive = simulateYear(game, recession, allocationTemplates.defensive)
    const growth = simulateYear(game, recession, badConcentrated)

    expect(defensive.annualReturn).toBeGreaterThan(growth.annualReturn)
    expect(defensive.drawdown).toBeLessThan(growth.drawdown)
  })

  it('penalizes concentrated all-in risk control', () => {
    const scenario = scenarios[4]
    const game = createInitialGame()
    const steady = simulateYear(game, scenario, allocationTemplates.steady)
    const concentrated = simulateYear(game, scenario, badConcentrated)

    expect(steady.endingScores.riskControl).toBeGreaterThan(concentrated.endingScores.riskControl)
  })

  it('calculates profit/loss statistics', () => {
    let game = createInitialGame()
    const result1 = simulateYear(game, scenarios[0], allocationTemplates.steady)
    game = applyYearResult(game, result1)
    const result2 = simulateYear(game, scenarios[1], allocationTemplates.growth)
    game = applyYearResult(game, result2)

    const stats = calculateStatistics(game)
    expect(stats.completedYears).toBe(2)
    expect(stats.totalProfitLoss).toBe(stats.finalAssets - stats.initialCapital)
    expect(stats.bestYearReturn).toBeGreaterThanOrEqual(stats.worstYearReturn)
  })

  it('calculates full-server percentile ranking from current account performance', () => {
    const averagePlayer = createInitialGame()
    const strongPlayer = { ...createInitialGame(), currentYear: 8, totalAssets: 1_850_000, maxDrawdown: 0.18 }
    const weakPlayer = { ...createInitialGame(), currentYear: 8, totalAssets: 620_000, maxDrawdown: 0.62 }

    expect(calculatePlayerPercentile(averagePlayer).topPercent).toBeGreaterThan(0)
    expect(calculatePlayerPercentile(averagePlayer).topPercent).toBeLessThanOrEqual(100)
    expect(calculatePlayerPercentile(strongPlayer).topPercent).toBeLessThan(calculatePlayerPercentile(averagePlayer).topPercent)
    expect(calculatePlayerPercentile(weakPlayer).topPercent).toBeGreaterThan(calculatePlayerPercentile(averagePlayer).topPercent)
  })

  it('supports at least 10 endings', () => {
    expect(endings.length).toBeGreaterThanOrEqual(10)
    expect(selectEnding(createInitialGame())).toBeTruthy()
  })

  it('can liquidate repeated concentrated high-risk mistakes', () => {
    let game = createInitialGame()
    for (let index = 0; index < 8 && !game.liquidationReason; index += 1) {
      const scenario = scenarios[index]
      const result = simulateYear(game, scenario, badConcentrated)
      game = applyYearResult(game, result)
      game = { ...game, status: 'briefing', currentYear: game.currentYear + 1 }
    }

    expect(game.flags.allInYears).toBeGreaterThanOrEqual(3)
    expect(game.flags.concentratedYears).toBeGreaterThanOrEqual(3)
  })

  it('prompts to exit when drawdown is greater than 50 percent', () => {
    const game = { ...createInitialGame(), maxDrawdown: 0.51 }
    const result = simulateYear(game, scenarios[0], allocationTemplates.steady)
    const prompt = shouldShowExitPrompt(game, result)

    expect(prompt?.trigger).toBe('drawdown')
    expect(prompt?.message).toContain('回撤')
  })

  it('prompts to exit when total return is greater than 50 percent', () => {
    const game = { ...createInitialGame(), totalAssets: 1_510_000, peakAssets: 1_510_000 }
    const result = simulateYear(game, scenarios[0], allocationTemplates.cash)
    const prompt = shouldShowExitPrompt(game, result)

    expect(prompt?.trigger).toBe('profit')
    expect(prompt?.message).toContain('收益率')
  })

  it('records active exit reason and latest account snapshot', () => {
    let game = createInitialGame()
    const result = simulateYear(game, scenarios[0], allocationTemplates.steady)
    game = applyYearResult(game, result)
    const exitInfo = createActiveExitInfo(game, '玩家选择主动止盈退出。', 'take-profit')
    game = { ...game, exitInfo }

    const stats = calculateStatistics(game)
    expect(stats.exitType).toBe('active')
    expect(stats.exitTrigger).toBe('take-profit')
    expect(stats.exitSnapshot?.year).toBe(result.year)
    expect(stats.exitSnapshot?.totalAssets).toBe(result.endAssets)
    expect(stats.earlyEndReason).toContain('主动止盈')
  })

  it('records passive cash wipeout exit and account state', () => {
    const game = { ...createInitialGame(), totalAssets: 1, peakAssets: 1_000_000 }
    const result = simulateYear(game, scenarios[4], leveragedWipeout)
    const nextGame = applyYearResult(game, result)
    const stats = calculateStatistics(nextGame)

    expect(nextGame.exitInfo?.type).toBe('passive')
    expect(nextGame.exitInfo?.trigger).toBe('cash-wipeout')
    expect(stats.exitSnapshot?.totalAssets).toBe(0)
    expect(stats.earlyEndReason).toContain('现金全部亏损')
  })
})
