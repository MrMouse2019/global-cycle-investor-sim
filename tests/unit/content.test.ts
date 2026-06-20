import { describe, expect, it } from 'vitest'
import { events } from '../../src/data/events/events'
import { markets } from '../../src/data/markets/markets'
import { scenarios } from '../../src/data/cycles/scenarios'
import { sectors } from '../../src/data/sectors/sectors'
import { stockPool } from '../../src/data/stocks/stockPool'
import { eventSchema, marketSchema, sectorSchema, stockSchema, yearScenarioSchema } from '../../src/domain/content/schemas'

describe('content schemas', () => {
  it('validates static content', () => {
    expect(markets.map((market) => marketSchema.parse(market))).toHaveLength(6)
    expect(sectors.map((sector) => sectorSchema.parse(sector))).toHaveLength(8)
    expect(stockPool.map((stock) => stockSchema.parse(stock))).toHaveLength(100)
    expect(events.map((event) => eventSchema.parse(event)).length).toBeGreaterThanOrEqual(4)
    expect(scenarios.map((scenario) => yearScenarioSchema.parse(scenario))).toHaveLength(20)
  })
})
