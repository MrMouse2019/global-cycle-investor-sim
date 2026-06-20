import { markets } from '../data/markets/markets'
import { sectors } from '../data/sectors/sectors'
import { getDisplayYearLabel } from '../domain/simulation/engine'
import { getCurrentScenario, useGameStore } from '../features/campaign-flow/gameStore'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'

export function AnnualBriefPage() {
  const { game, goToAllocation } = useGameStore()
  const scenario = getCurrentScenario(game)
  const preferredMarkets = markets.filter((market) => scenario.preferredMarkets.includes(market.id))
  const preferredSectors = sectors.filter((sector) => scenario.preferredSectors.includes(sector.id))
  const warningSectors = sectors.filter((sector) => scenario.warningSectors.includes(sector.id))
  const marketPerformance = markets.map((market) => ({
    id: market.id,
    name: market.name,
    text: scenario.marketPerformance[market.id],
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <p className="text-sm font-semibold text-gold">{getDisplayYearLabel(game)}</p>
        <h2 className="mt-2 text-3xl font-black">{scenario.title}</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">真实历史年份：{scenario.historicalYear}</p>
        <p className="mt-4 text-slate-600">{scenario.summary}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Info label="宏观周期" value={scenario.cycleLabel} />
          <Info label="货币政策" value={scenario.policy === 'loose' ? '宽松' : scenario.policy === 'tight' ? '紧缩' : '中性'} />
          <Info label="风险偏好" value={scenario.riskPreference === 'high' ? '高' : scenario.riskPreference === 'low' ? '低' : '中'} />
        </div>
        <div className="mt-6 grid gap-3">
          <TextBlock label="宏观主线" value={scenario.macroMainline} />
          <TextBlock label="货币政策" value={scenario.monetaryPolicyDetail} />
          <TextBlock label="全球供需关系" value={scenario.supplyDemandDetail} />
          <TextBlock label="市场核心特征" value={scenario.marketCharacteristics} />
        </div>
        <div className="mt-6 rounded-2xl bg-gold/10 p-4 text-sm leading-6 text-slate-700">
          <strong>年度提示：</strong>{scenario.teachingHint}
        </div>
        <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          <strong>新手科普：</strong>{scenario.plainLanguage}
        </div>
        <Button onClick={goToAllocation} variant="primary">进入资产配置</Button>
      </Card>

      <div className="grid gap-4">
        <Card>
          <h3 className="text-lg font-bold">领涨 / 领跌赛道</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ThemeList title="领涨主线" items={scenario.leadingThemes} tone="good" />
            <ThemeList title="领跌压力" items={scenario.laggingThemes} tone="bad" />
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold">本年相对顺风市场</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {preferredMarkets.map((market) => (
              <span key={market.id} className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                {market.name}
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold">本年相对顺风板块</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {preferredSectors.map((sector) => (
              <span key={sector.id} className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                {sector.name}
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold">需要谨慎的板块</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {warningSectors.map((sector) => (
              <span key={sector.id} className="rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {sector.name}
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold">主要市场历史表现</h3>
          <div className="mt-3 grid gap-2">
            {marketPerformance.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-3 text-sm leading-6">
                <span className="font-bold text-slate-900">{item.name}</span>
                <span className="ml-2 text-slate-600">{item.text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  )
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6">
      <p className="font-bold text-slate-900">{label}</p>
      <p className="mt-1 text-slate-600">{value}</p>
    </div>
  )
}

function ThemeList({ title, items, tone }: { title: string; items: string[]; tone: 'good' | 'bad' }) {
  const colorClass = tone === 'good' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'

  return (
    <div>
      <p className="text-sm font-bold text-slate-700">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`rounded-full px-3 py-2 text-sm font-semibold ${colorClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
