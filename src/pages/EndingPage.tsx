import { calculateStatistics, selectEnding } from '../domain/simulation/engine'
import { useGameStore } from '../features/campaign-flow/gameStore'
import { formatMoney, formatPercent } from '../shared/lib/format'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'
import { Stat } from '../shared/ui/Stat'

export function EndingPage() {
  const { game, resetGame } = useGameStore()
  const ending = selectEnding(game)
  const stats = calculateStatistics(game)

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <p className="text-sm font-semibold text-gold">{ending.badge}</p>
        <h2 className="mt-2 text-3xl font-black">{ending.title}</h2>
        <p className="mt-4 leading-7 text-slate-600">{ending.description}</p>
        {stats.earlyEnded ? (
          <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-800">
            <strong>{stats.exitType === 'active' ? '主动退出原因：' : '被动退出原因：'}</strong>{stats.earlyEndReason}
          </div>
        ) : null}
        {stats.exitSnapshot ? (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <p className="font-bold">退出时账户状态</p>
            <p>第 {stats.exitSnapshot.year} 年，账户资产 {formatMoney(stats.exitSnapshot.totalAssets)}，现金 {formatMoney(stats.exitSnapshot.cash)}。</p>
            <p>退出时累计收益率 {formatPercent(stats.exitSnapshot.totalReturn)}，最大回撤 {formatPercent(stats.exitSnapshot.maxDrawdown)}。</p>
          </div>
        ) : null}
        <div className="mt-6">
          <h3 className="font-bold">解锁学习内容</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {ending.unlockedLessons.map((lesson) => <li key={lesson}>• {lesson}</li>)}
          </ul>
        </div>
        <div className="mt-6">
          <Button onClick={resetGame}>重新开始</Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-black">盈利 / 亏损统计</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Stat label="初始本金" value={formatMoney(stats.initialCapital)} />
          <Stat label="最终资产" value={formatMoney(stats.finalAssets)} />
          <Stat label="总盈利/亏损" value={formatMoney(stats.totalProfitLoss)} />
          <Stat label="总收益率" value={formatPercent(stats.totalReturn)} />
          <Stat label="年化收益率" value={formatPercent(stats.annualizedReturn)} />
          <Stat label="已完成年份" value={`${stats.completedYears} 年`} />
          <Stat label="盈利年份" value={`${stats.profitYears} 年`} />
          <Stat label="亏损年份" value={`${stats.lossYears} 年`} />
          <Stat label="最好年份" value={formatPercent(stats.bestYearReturn)} />
          <Stat label="最差年份" value={formatPercent(stats.worstYearReturn)} />
          <Stat label="平均盈利年份收益" value={formatPercent(stats.averageProfitYearReturn)} />
          <Stat label="平均亏损年份收益" value={formatPercent(stats.averageLossYearReturn)} />
          <Stat label="全局最大回撤" value={formatPercent(stats.maxDrawdown)} />
          <Stat label="退出类型" value={stats.exitType === 'active' ? '主动退出' : stats.exitType === 'passive' ? '被动退出' : '正常结束'} />
        </div>
      </Card>
    </div>
  )
}
