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
const stockStyles: Stock['style'][] = ['leader', 'growth', 'cyclical', 'defensive']

function topWeightedId<T extends string>(weights: Record<T, number>): T {
  return Object.entries(weights).sort((left, right) => Number(right[1]) - Number(left[1]))[0][0] as T
}

export function AllocationPage() {
  const { game, submitAllocation } = useGameStore()
  const scenario = getCurrentScenario(game)
  const defaultMarketId = scenario.preferredMarkets[0] ?? 'us'
  const defaultSectorId = scenario.preferredSectors[0] ?? 'technology'
  const [allocation, setAllocation] = useState<Allocation>({
    ...allocationTemplates.steady,
    selectedMarketId: defaultMarketId,
    selectedSectorId: defaultSectorId,
    selectedStocks: [],
    stockWeights: {},
  })
  const [stockMarketId, setStockMarketId] = useState<MarketId>(defaultMarketId)
  const [stockSectorId, setStockSectorId] = useState<SectorId>(defaultSectorId)
  const [stockStyle, setStockStyle] = useState<Stock['style']>('leader')
  const recommendations = recommendStocks({
    year: game.currentYear,
    marketId: stockMarketId,
    sectorId: stockSectorId,
    style: stockStyle,
    scenario,
  })
  const errors = validateAllocation(allocation)
  const selectedStockWeights = allocation.stockWeights ?? {}
  const selectedStockWeightTotal = Object.values(selectedStockWeights).reduce((total, value) => total + value, 0)

  function applyTemplate(templateId: AllocationTemplateId) {
    const template = structuredClone(allocationTemplates[templateId])
    setAllocation((current) => ({
      ...template,
      selectedMarketId: undefined,
      selectedSectorId: undefined,
      selectedStocks: templateId === 'cash' ? [] : current.selectedStocks ?? [],
      stockWeights: templateId === 'cash' ? {} : current.stockWeights ?? {},
    }))
    if (templateId !== 'cash') {
      setStockMarketId(topWeightedId(template.marketWeights))
      setStockSectorId(topWeightedId(template.sectorWeights))
    }
  }

  function reusePreviousAllocation() {
    if (!game.previousAllocation) return
    setAllocation({
      ...structuredClone(game.previousAllocation),
      selectedMarketId: undefined,
      selectedSectorId: undefined,
      selectedStocks: game.previousAllocation.selectedStocks ?? [],
      stockWeights: game.previousAllocation.stockWeights ?? equalStockWeights(game.previousAllocation.selectedStocks ?? []),
    })
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

  function toggleStock(stockId: string) {
    setAllocation((current) => {
      const selectedStocks = current.selectedStocks ?? []
      const exists = selectedStocks.includes(stockId)
      if (exists) {
        const nextStocks = selectedStocks.filter((id) => id !== stockId)
        return { ...current, selectedStocks: nextStocks, stockWeights: equalStockWeights(nextStocks) }
      }
      if (selectedStocks.length >= 3) return current
      const nextStocks = [...selectedStocks, stockId]
      return { ...current, selectedStocks: nextStocks, stockWeights: equalStockWeights(nextStocks) }
    })
  }

  function updateStockWeight(stockId: string, value: number) {
    setAllocation((current) => ({
      ...current,
      stockWeights: { ...(current.stockWeights ?? {}), [stockId]: value },
    }))
  }

  return (
    <div className="grid gap-6">
      <nav className="grid gap-2 rounded-2xl bg-white/80 p-2 shadow-sm sm:grid-cols-3" aria-label="年度驾驶舱">
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-500">年度行情速览</div>
        <div className="rounded-xl bg-ink px-4 py-3 text-center text-sm font-black text-white">一键资产配置</div>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-500">年度结算 & 复盘</div>
      </nav>
      <div className="grid gap-6 pb-28">
      <Card>
        <h2 className="text-3xl font-black">年度资产配置</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          像调自选股一样调仓：选模板、看权重、挑 3 只拟买入。现金模式可以跳过股票。
        </p>
        <h3 className="mt-6 text-lg font-black">策略模板</h3>
        <button
          className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-black text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!game.previousAllocation}
          onClick={reusePreviousAllocation}
          type="button"
        >
          延续去年配置
          <span className="mt-1 block text-xs font-semibold text-slate-500">
            {game.previousAllocation ? '不想折腾就少交点情绪税。' : '第一年还没有旧仓位可以继承。'}
          </span>
        </button>
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
          <div className="fixed bottom-24 left-1/2 z-20 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full bg-amber-100 px-4 py-3 text-sm font-bold text-amber-900 shadow-lg">
            {errors[0]}
          </div>
        ) : null}
      </Card>

      <div className="grid gap-6">
        <WeightEditor collapsed title="市场权重" items={markets} weights={allocation.marketWeights} onChange={updateMarket} />
        <WeightEditor collapsed title="板块权重" items={sectors} weights={allocation.sectorWeights} onChange={updateSector} />
      </div>
      <Card>
        <h3 className="text-lg font-black">选股筛选器</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Segmented
            label="市场"
            options={markets.map((market) => ({ id: market.id, name: market.name }))}
            value={stockMarketId}
            onChange={(id) => setStockMarketId(id as MarketId)}
          />
          <Segmented
            label="板块"
            options={sectors.map((sector) => ({ id: sector.id, name: sector.name }))}
            value={stockSectorId}
            onChange={(id) => setStockSectorId(id as SectorId)}
          />
          <Segmented
            label="风格"
            options={stockStyles.map((style) => ({ id: style, name: styleLabel(style) }))}
            value={stockStyle}
            onChange={(id) => setStockStyle(id as Stock['style'])}
          />
        </div>
      </Card>
      <StockSelector
        disabled={allocation.investedRatio <= 0}
        previousStocks={game.previousAllocation?.selectedStocks ?? []}
        recommendations={recommendations}
        selectedWeights={selectedStockWeights}
        selectedStocks={allocation.selectedStocks ?? []}
        onToggle={toggleStock}
        onWeightChange={updateStockWeight}
      />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-slate-600">
            股票篮子 {formatPercent(selectedStockWeightTotal)} · 已选 {(allocation.selectedStocks ?? []).length} / 3
          </div>
          <Button onClick={() => submitAllocation(allocation)} disabled={errors.length > 0}>提交配置并结算</Button>
        </div>
      </div>
    </div>
  )
}

function StockSelector({
  disabled,
  previousStocks,
  recommendations,
  selectedWeights,
  selectedStocks,
  onToggle,
  onWeightChange,
}: {
  disabled: boolean
  previousStocks: string[]
  recommendations: Stock[]
  selectedWeights: Record<string, number>
  selectedStocks: string[]
  onToggle: (id: string) => void
  onWeightChange: (id: string, value: number) => void
}) {
  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold">重仓股票选择</h3>
          <p className="mt-1 text-sm text-slate-500">{disabled ? '当前为现金模式，可跳过股票选择。' : `已选择 ${selectedStocks.length} / 3 只`}</p>
        </div>
      </div>
      {selectedStocks.length ? (
        <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
          <p className="text-xs font-semibold text-white/50">持仓篮子</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedStocks.map((stockId) => {
              const stock = recommendations.find((item) => item.id === stockId)
              return (
                <span key={stockId} className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold">
                  {stock?.name ?? stockId} · {previousStocks.includes(stockId) ? '持有' : '拟买入'}
                </span>
              )
            })}
          </div>
          <div className="mt-4 grid gap-3">
            {selectedStocks.map((stockId) => (
              <label key={stockId} className="grid gap-2 text-xs font-semibold sm:grid-cols-[120px_1fr_56px] sm:items-center">
                <span>{recommendations.find((item) => item.id === stockId)?.name ?? stockId}</span>
                <input
                  className="accent-gold"
                  max="1"
                  min="0"
                  onChange={(event) => onWeightChange(stockId, Number(event.target.value))}
                  step="0.01"
                  type="range"
                  value={selectedWeights[stockId] ?? 0}
                />
                <span className="text-right tabular-nums">{formatPercent(selectedWeights[stockId] ?? 0)}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white">
        {recommendations.map((stock) => {
          const selected = selectedStocks.includes(stock.id)
          const locked = !selected && selectedStocks.length >= 3
          const wasHeld = previousStocks.includes(stock.id)
          const stateLabel = selected ? (wasHeld ? '持有' : '拟买入') : wasHeld ? '调出' : '观望'
          return (
            <button
              key={stock.id}
              className={`stock-board-row w-full border-b border-white/10 p-4 text-left transition last:border-b-0 ${
                selected
                  ? 'bg-emerald-500/15'
                  : locked || disabled
                    ? 'bg-slate-900 text-slate-500'
                    : 'hover:bg-white/5'
              }`}
              disabled={disabled || locked}
              onClick={() => onToggle(stock.id)}
              type="button"
            >
              <div>
                <p className="font-black">{stock.name}</p>
                <p className="mt-1 text-xs font-semibold text-white/50">
                  {markets.find((market) => market.id === stock.marketId)?.name} · {sectors.find((sector) => sector.id === stock.sectorId)?.name}
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold">波动 {formatPercent(stock.volatility)}</span>
              <span className="rounded-full bg-blue-400/15 px-2 py-1 text-xs font-semibold text-blue-100">{stock.style === 'growth' ? '成长票' : stock.style === 'cyclical' ? '周期票' : stock.style === 'defensive' ? '防御票' : '龙头票'}</span>
              <span className="rounded-full bg-gold/20 px-2 py-1 text-xs font-semibold text-gold">{stateLabel}</span>
              <p className="text-sm leading-6 text-white/70">{stock.description}</p>
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
  collapsed?: boolean
}

function WeightEditor<T extends string>({ title, items, weights, onChange, collapsed = false }: WeightEditorProps<T>) {
  const total = items.reduce((acc, item) => acc + weights[item.id], 0)
  return (
    <details className="rounded-3xl bg-white/90 p-6 shadow-soft" open={!collapsed}>
      <summary className="cursor-pointer list-none">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="text-sm text-slate-500">合计 {formatPercent(total)}</span>
      </div>
      </summary>
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
    </details>
  )
}

function equalStockWeights(stockIds: string[]) {
  if (!stockIds.length) return {}
  const base = Math.floor((1 / stockIds.length) * 100) / 100
  const weights = Object.fromEntries(stockIds.map((stockId) => [stockId, base]))
  const remainder = 1 - Object.values(weights).reduce((total, value) => total + value, 0)
  weights[stockIds[0]] = Number((weights[stockIds[0]] + remainder).toFixed(2))
  return weights
}

function styleLabel(style: Stock['style']) {
  return style === 'leader' ? '龙头' : style === 'growth' ? '成长' : style === 'cyclical' ? '周期' : style === 'defensive' ? '防御' : '反转'
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { id: T; name: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div>
      <p className="text-xs font-black text-slate-500">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            className={`rounded-full px-3 py-2 text-xs font-black transition ${
              value === option.id ? 'bg-ink text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={() => onChange(option.id)}
            type="button"
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  )
}
