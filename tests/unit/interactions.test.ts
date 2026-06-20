import { describe, expect, it } from 'vitest'
import { scenarios } from '../../src/data/cycles/scenarios'
import { eventDecisions } from '../../src/data/interactions/eventDecisions'
import { allocationTemplates } from '../../src/domain/simulation/allocationTemplates'
import {
  applyYearResult,
  calculateTradeCost,
  deriveMindsetDebuff,
  resolveEventDecision,
  selectYearDecision,
  simulateYear,
} from '../../src/domain/simulation/engine'
import { createInitialGame } from '../../src/features/campaign-flow/gameStore'

describe('interaction fixtures', () => {
  it('provides decision options for meaningful historical events', () => {
    const scenarioEventIds = new Set(scenarios.flatMap((scenario) => scenario.eventIds))

    expect(eventDecisions.length).toBeGreaterThanOrEqual(8)
    expect(eventDecisions.every((decision) => scenarioEventIds.has(decision.eventId))).toBe(true)
    expect(eventDecisions.every((decision) => decision.options.length === 2)).toBe(true)
    expect(eventDecisions.flatMap((decision) => decision.options).every((option) => option.roast.length > 6)).toBe(true)
  })

  it('selects deterministic event decisions from the current scenario', () => {
    const game = createInitialGame()
    const scenario = scenarios.find((item) => item.historicalYear === 2014)!
    const decision = selectYearDecision(game, scenario)

    expect(decision?.eventId).toBe('stock-connect-2014')
  })

  it('resolves event decisions by option id', () => {
    const decision = eventDecisions[0]
    const result = resolveEventDecision(decision, decision.options[1].id)

    expect(result.option.id).toBe(decision.options[1].id)
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

  it('stores previous allocation and event decisions after applying a result', () => {
    const scenario = scenarios.find((item) => item.historicalYear === 2014)!
    const pendingDecision = selectYearDecision(createInitialGame(), scenario)
    const game = { ...createInitialGame(), pendingDecision }
    const result = simulateYear(game, scenario, {
      ...allocationTemplates.growth,
      selectedStocks: ['a-share-technology-foxconn', 'a-share-technology-zte', 'a-share-technology-iflytek'],
      eventDecisionOptionId: pendingDecision?.options[0].id,
    })
    const nextGame = applyYearResult(game, result)

    expect(nextGame.previousAllocation).toEqual(result.allocation)
    expect(nextGame.decisionHistory).toHaveLength(1)
    expect(nextGame.npcMessages.length).toBeGreaterThan(0)
  })
})
