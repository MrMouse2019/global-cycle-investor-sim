import { useState } from 'react'
import { markets } from '../data/markets/markets'
import { sectors } from '../data/sectors/sectors'
import { allocationTemplates, templateLabels } from '../domain/simulation/allocationTemplates'
import { recommendStocks, validateAllocation } from '../domain/simulation/engine'
import type { Allocation, AllocationTemplateId, MarketId, SectorId, Stock } from '../domain/types/game'
import { getCurrentScenario, useGameStore } from '../features/campaign-flow/gameStore'
import { formatPercent } from '../shared/lib/format'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'

const templateIds = Object.keys(allocationTemplates) as AllocationTemplateId[]

export function AllocationPage() {
  const { game, submitAllocation } = useGameStore()
  const scenario = getCurrentScenario(game)
  const defaultMarketId = scenario.preferredMarkets[0] ?? 'a-share'
  const defaultSectorId = scenario.preferredSectors[0] ?? 'technology'
  const [allocation, setAllocation] = useState<Allocation>({
    ...allocationTemplates.steady,
    selectedMarketId: defaultMarketId,
    selectedSectorId: defaultSectorId,
    selectedStocks: [],
  })
  const selectedMarketId = allocation.selectedMarketId ?? defaultMarketId
  const selectedSectorId = allocation.selectedSectorId ?? defaultSectorId
  const recommendations = recommendStocks({
    year: game.currentYear,
    marketId: selectedMarketId,
    sectorId: selectedSectorId,
    scenario,
  })
  const errors = validateAllocation(allocation)

  function applyTemplate(templateId: AllocationTemplateId) {
    setAllocation((current) => ({
      ...structuredClone(allocationTemplates[templateId]),
      selectedMarketId: current.selectedMarketId ?? defaultMarketId,
      selectedSectorId: current.selectedSectorId ?? defaultSectorId,
      selectedStocks: templateId === 'cash' ? [] : current.selectedStocks ?? [],
    }))
  }

  function updateInvestedRatio(value: number) {
    setAllocation((current) => ({ ...current, investedRatio: value, templateId: 'custom' }))
  }

  function updateMarket(id: MarketId, value: number) {
    setAllocation((current) => ({
      ...current,
      templateId: 'custom',
      marketWeights: { ...current.marketWeights, [id]: value },
    }))
  }

  function updateSector(id: SectorId, value: number) {
    setAllocation((current) => ({
      ...current,
      templateId: 'custom',
      sectorWeights: { ...current.sectorWeights, [id]: value },
    }))
  }

  function updateSelectedMarket(id: MarketId) {
    setAllocation((current) => ({
      ...current,
      selectedMarketId: id,
      selectedStocks: [],
    }))
  }

  function updateSelectedSector(id: SectorId) {
    setAllocation((current) => ({
      ...current,
      selectedSectorId: id,
      selectedStocks: [],
    }))
  }

  function toggleStock(stockId: string) {
    setAllocation((current) => {
      const selectedStocks = current.selectedStocks ?? []
      const exists = selectedStocks.includes(stockId)
      if (exists) {
        return { ...current, selectedStocks: selectedStocks.filter((id) => id !== stockId) }
      }
      if (selectedStocks.length >= 3) return current
      return { ...current, selectedStocks: [...selectedStocks, stockId] }
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <h2 className="text-3xl font-black">年度资产配置</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          先选择目标市场和板块，再从系统推荐的 6 只股票中挑选 3 只重仓。只有总投入仓位为 0% 时，才会按只持有现金处理并跳过股票选择。
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {templateIds.map((templateId) => (
            <button
              key={templateId}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                allocation.templateId === templateId
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
              onClick={() => applyTemplate(templateId)}
              type="button"
            >
              {templateLabels[templateId]}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <label className="text-sm font-bold">总投入仓位：{formatPercent(allocation.investedRatio)}</label>
          <input
            className="mt-3 w-full accent-gold"
            max="2"
            min="0"
            onChange={(event) => updateInvestedRatio(Number(event.target.value))}
            step="0.05"
            type="range"
            value={allocation.investedRatio}
          />
        </div>
        {errors.length ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            {errors.map((error) => <p key={error}>{error}</p>)}
          </div>
        ) : null}
        <div className="mt-6">
          <Button onClick={() => submitAllocation(allocation)} disabled={errors.length > 0}>提交配置并结算</Button>
        </div>
      </Card>

      <div className="grid gap-6">
        <PreferenceSelector
          selectedMarketId={selectedMarketId}
          selectedSectorId={selectedSectorId}
          onMarketChange={updateSelectedMarket}
          onSectorChange={updateSelectedSector}
        />
        <StockSelector
          disabled={allocation.investedRatio <= 0}
          recommendations={recommendations}
          selectedStocks={allocation.selectedStocks ?? []}
          onToggle={toggleStock}
        />
        <WeightEditor title="市场权重" items={markets} weights={allocation.marketWeights} onChange={updateMarket} />
        <WeightEditor title="板块权重" items={sectors} weights={allocation.sectorWeights} onChange={updateSector} />
      </div>
    </div>
  )
}

function PreferenceSelector({
  selectedMarketId,
  selectedSectorId,
  onMarketChange,
  onSectorChange,
}: {
  selectedMarketId: MarketId
  selectedSectorId: SectorId
  onMarketChange: (id: MarketId) => void
  onSectorChange: (id: SectorId) => void
}) {
  return (
    <Card>
      <h3 className="text-lg font-bold">目标市场与板块</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          目标市场
          <select
            className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm"
            onChange={(event) => onMarketChange(event.target.value as MarketId)}
            value={selectedMarketId}
          >
            {markets.map((market) => (
              <option key={market.id} value={market.id}>{market.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          目标板块
          <select
            className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm"
            onChange={(event) => onSectorChange(event.target.value as SectorId)}
            value={selectedSectorId}
          >
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>{sector.name}</option>
            ))}
          </select>
        </label>
      </div>
    </Card>
  )
}

function StockSelector({
  disabled,
  recommendations,
  selectedStocks,
  onToggle,
}: {
  disabled: boolean
  recommendations: Stock[]
  selectedStocks: string[]
  onToggle: (id: string) => void
}) {
  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold">重仓股票选择</h3>
          <p className="mt-1 text-sm text-slate-500">{disabled ? '当前为现金模式，可跳过股票选择。' : `已选择 ${selectedStocks.length} / 3 只`}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {recommendations.map((stock) => {
          const selected = selectedStocks.includes(stock.id)
          const locked = !selected && selectedStocks.length >= 3
          return (
            <button
              key={stock.id}
              className={`min-h-[132px] rounded-2xl border p-4 text-left transition ${
                selected
                  ? 'border-gold bg-gold/10'
                  : locked || disabled
                    ? 'border-slate-100 bg-slate-50 text-slate-400'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
              disabled={disabled || locked}
              onClick={() => onToggle(stock.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black">{stock.name}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {markets.find((market) => market.id === stock.marketId)?.name} · {sectors.find((sector) => sector.id === stock.sectorId)?.name}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  波动 {formatPercent(stock.volatility)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{stock.description}</p>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

type WeightEditorProps<T extends string> = {
  title: string
  items: { id: T; name: string }[]
  weights: Record<T, number>
  onChange: (id: T, value: number) => void
}

function WeightEditor<T extends string>({ title, items, weights, onChange }: WeightEditorProps<T>) {
  const total = items.reduce((acc, item) => acc + weights[item.id], 0)
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="text-sm text-slate-500">合计 {formatPercent(total)}</span>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <label key={item.id} className="grid gap-2 sm:grid-cols-[96px_1fr_56px] sm:items-center">
            <span className="text-sm font-semibold">{item.name}</span>
            <input
              className="accent-gold"
              max="1"
              min="0"
              onChange={(event) => onChange(item.id, Number(event.target.value))}
              step="0.01"
              type="range"
              value={weights[item.id]}
            />
            <span className="text-right text-sm tabular-nums text-slate-500">{formatPercent(weights[item.id])}</span>
          </label>
        ))}
      </div>
    </Card>
  )
}
