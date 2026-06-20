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

  it('uses a strict 2005-2024 historical campaign timeline with teaching context', () => {
    expect(scenarios.map((scenario) => scenario.historicalYear)).toEqual(
      Array.from({ length: 20 }, (_, index) => 2005 + index),
    )

    const requiredYears = [2008, 2015, 2019, 2020, 2022, 2023, 2024]
    requiredYears.forEach((year) => {
      const scenario = scenarios.find((item) => item.historicalYear === year)
      expect(scenario, `missing historical year ${year}`).toBeTruthy()
      expect(scenario?.macroMainline.length).toBeGreaterThan(6)
      expect(scenario?.leadingThemes.length).toBeGreaterThanOrEqual(1)
      expect(scenario?.laggingThemes.length).toBeGreaterThanOrEqual(1)
      expect(scenario?.marketCharacteristics.length).toBeGreaterThan(6)
      expect(scenario?.plainLanguage.length).toBeGreaterThan(12)
      expect(scenario?.monetaryPolicyDetail.length).toBeGreaterThan(6)
      expect(scenario?.supplyDemandDetail.length).toBeGreaterThan(6)
      expect(Object.keys(scenario?.marketPerformance ?? {})).toHaveLength(6)
    })
  })

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
})
