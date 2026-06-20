import { useState } from 'react'
import { calculateStatistics } from '../domain/simulation/engine'
import { useGameStore } from '../features/campaign-flow/gameStore'
import { DISCLAIMER, LIQUIDATION_RATIO } from '../shared/constants/app'
import { formatMoney, formatPercent, scoreLabel } from '../shared/lib/format'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'
import { AllocationPage } from '../pages/AllocationPage'
import { AnnualBriefPage } from '../pages/AnnualBriefPage'
import { EndingPage } from '../pages/EndingPage'
import { ReviewPage } from '../pages/ReviewPage'
import { SettlementPage } from '../pages/SettlementPage'

export function App() {
  const { game, startGame, resetGame } = useGameStore()
  const hasSave = game.status !== 'idle' || game.history.length > 0

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7dc,#f6f2ea_42%,#e8edf7)] px-4 py-6 text-ink sm:px-6 lg:px-8">
      <main className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gold">Global Cycle Investor Sim</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">全球周期投资模拟器</h1>
          </div>
          {hasSave ? <Button variant="secondary" onClick={resetGame}>重置游戏</Button> : null}
        </header>

        {game.status === 'idle' ? (
          <HomePage startGame={startGame} hasSave={hasSave} />
        ) : game.status === 'briefing' ? (
          <AnnualBriefPage />
        ) : game.status === 'allocating' ? (
          <AllocationPage />
        ) : game.status === 'settling' ? (
          <SettlementPage />
        ) : game.status === 'reviewing' ? (
          <ReviewPage />
        ) : (
          <EndingPage />
        )}

        <footer className="mt-8 rounded-3xl bg-white/70 p-4 text-sm text-slate-600 shadow-sm">
          {DISCLAIMER}
        </footer>
      </main>
    </div>
  )
}

function HomePage({ startGame, hasSave }: { startGame: (totalYears?: number | null) => void; hasSave: boolean }) {
  const [fixedYears, setFixedYears] = useState(20)
  const previewStats = calculateStatistics({
    status: 'idle',
    currentYear: 1,
    totalYears: null,
    initialCapital: 1_000_000,
    cash: 1_000_000,
    totalAssets: 1_000_000,
    peakAssets: 1_000_000,
    maxDrawdown: 0,
    scores: { marketCognition: 50, sectorSensitivity: 50, riskControl: 70 },
    history: [],
    flags: { allInYears: 0, concentratedYears: 0, cashHeavyYears: 0, inverseCycleYears: 0, highRiskEventExposureYears: 0 },
    decisionHistory: [],
    npcMessages: [],
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="flex flex-col justify-between gap-8">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-gold/10 px-3 py-1 text-sm font-semibold text-gold">
            至少 20 年 · 可提前清仓 · 教育模拟
          </p>
          <h2 className="text-4xl font-black leading-tight sm:text-5xl">
            先看宏观 β，再选重仓股票。
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            你将以 100 万模拟本金开始，穿越多轮复苏、宽松、过热、滞胀、紧缩与衰退。
            每年先选择目标市场和板块，再从系统推荐的 6 只股票中挑选 3 只重仓持有。默认没有固定终局，直到你主动退出或触发被动清仓。
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => startGame(null)}>{hasSave ? '重新开始无限模式' : '开始无限模式'}</Button>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <label className="text-sm font-semibold text-slate-600" htmlFor="fixed-years">固定轮次</label>
            <input
              className="w-20 rounded-xl border border-slate-200 px-2 py-1 text-sm font-bold"
              id="fixed-years"
              max="80"
              min="1"
              onChange={(event) => setFixedYears(Math.max(1, Number(event.target.value)))}
              type="number"
              value={fixedYears}
            />
            <span className="text-sm text-slate-500">年</span>
          </div>
          <Button onClick={() => startGame(fixedYears)} variant="secondary">开始固定轮次</Button>
        </div>
      </Card>

      <div className="grid gap-4">
        <Card>
          <h3 className="text-lg font-bold">MVP 覆盖</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>六大市场：A股、H股、美股、日股、台股、韩股</li>
            <li>八大板块：消费、科技、医药、新能源、有色、金融、军工、农业</li>
            <li>100 只股票池，按市场和板块偏好动态推荐</li>
            <li>不少于 10 种结局，含提前清仓路径</li>
            <li>最终页输出完整盈利/亏损统计</li>
          </ul>
        </Card>
        <Card>
          <h3 className="text-lg font-bold">风控线</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            清仓线为初始本金的 {formatPercent(LIQUIDATION_RATIO)}。低于清仓线、深度回撤或连续高风险集中押注都可能提前结束。
          </p>
          <p className="mt-3 text-xs text-slate-500">当前预览统计：{formatMoney(previewStats.finalAssets)}，{scoreLabel(70)}风控起步。</p>
        </Card>
      </div>
    </div>
  )
}
