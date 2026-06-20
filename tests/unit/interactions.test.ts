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
