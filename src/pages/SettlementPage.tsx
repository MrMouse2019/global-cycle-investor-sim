import { calculatePlayerPercentile } from '../domain/simulation/engine'
import { useGameStore } from '../features/campaign-flow/gameStore'
import { DISCLAIMER } from '../shared/constants/app'
import { formatMoney, formatPercent } from '../shared/lib/format'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'
import { Stat } from '../shared/ui/Stat'

export function SettlementPage() {
  const { game, goToReview, endInvestment, continueInvestment } = useGameStore()
  const result = game.lastResult
  const prompt = game.exitPrompt

  if (!result) return null

  const endReason =
    prompt?.trigger === 'profit'
      ? '累计收益率超过 50%，玩家选择主动止盈退出。'
      : prompt?.trigger === 'drawdown'
        ? '账户回撤超过 50%，玩家选择主动止损退出。'
        : '玩家选择主动退出投资。'
  const ranking = calculatePlayerPercentile({
    ...game,
    totalAssets: result.endAssets,
    maxDrawdown: Math.max(game.maxDrawdown, result.drawdown),
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <Card>
        <p className="text-sm font-semibold text-gold">第 {result.year} 年结算</p>
        <h2 className="mt-2 text-3xl font-black">{result.liquidation.liquidated ? '触发被动退出检查' : '年度结果已生成'}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="年度收益率" value={formatPercent(result.annualReturn)} />
          <Stat label="年度盈利/亏损" value={formatMoney(result.profitLoss)} />
          <Stat label="期末资产" value={formatMoney(result.endAssets)} />
          <Stat label="期初资产" value={formatMoney(result.startAssets)} />
          <Stat label="最大回撤估算" value={formatPercent(result.drawdown)} />
          <Stat label="被动退出检查" value={result.liquidation.liquidated ? '已触发' : '未触发'} />
        </div>
        {result.stockResult.selectedStocks.length ? (
          <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
            <p className="font-bold">重仓股票结算</p>
            <p className="mt-1">
              本年持有 {result.stockResult.selectedStocks.map((stock) => stock.name).join('、')}，
              股票篮子收益约 {formatPercent(result.stockResult.averageReturn)}，
              对年度组合收益贡献约 {formatPercent(result.stockResult.contribution)}。
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            本年选择现金模式，未纳入重仓股票收益。
          </div>
        )}
        {result.liquidation.liquidated ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-800">
            <strong>被动退出原因：</strong>{result.liquidation.reason}
            <p className="mt-2">这是高杠杆/借贷风险或仓位控制失当导致账户无法继续投资的被动退出。</p>
          </div>
        ) : null}
        {prompt ? (
          <div className="mt-6 rounded-3xl border border-gold/40 bg-gold/10 p-5">
            <p className="text-sm font-semibold text-gold">退出决策提示</p>
            <h3 className="mt-2 text-xl font-black">{prompt.trigger === 'profit' ? '是否止盈退出？' : '是否止损退出？'}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{prompt.message}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="累计收益率" value={formatPercent(prompt.snapshot.totalReturn)} />
              <Stat label="最大回撤" value={formatPercent(prompt.snapshot.maxDrawdown)} />
              <Stat label="账户资产" value={formatMoney(prompt.snapshot.totalAssets)} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={continueInvestment}>继续投资</Button>
              <Button onClick={() => endInvestment(endReason, prompt.trigger === 'profit' ? 'take-profit' : 'stop-loss')} variant="quiet">
                结束投资
              </Button>
            </div>
          </div>
        ) : null}
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{DISCLAIMER}</div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={goToReview}>{result.liquidation.liquidated ? '查看退出结局' : '阅读年度复盘'}</Button>
          {!result.liquidation.liquidated && !prompt ? (
            <>
              <Button
                onClick={() => endInvestment('玩家选择主动止盈退出。', 'take-profit')}
                variant="quiet"
              >
                赚够了，止盈退出
              </Button>
              <Button
                onClick={() => endInvestment('玩家选择主动止损退出。', 'stop-loss')}
                variant="quiet"
              >
                亏够了，止损退出
              </Button>
            </>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-4">
        <Card>
          <h3 className="text-lg font-bold">评分变化</h3>
          <div className="mt-4 grid gap-3">
            <ScoreDelta label="市场认知" value={result.scoreDelta.marketCognition} total={result.endingScores.marketCognition} />
            <ScoreDelta label="板块敏感" value={result.scoreDelta.sectorSensitivity} total={result.endingScores.sectorSensitivity} />
            <ScoreDelta label="风控评分" value={result.scoreDelta.riskControl} total={result.endingScores.riskControl} />
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold">全服收益排名</h3>
          <div className="mt-4 rounded-2xl bg-ink p-4 text-white">
            <p className="text-sm text-white/70">当前账户处于全体玩家</p>
            <p className="mt-1 text-3xl font-black">前 {ranking.topPercent}%</p>
            <p className="mt-2 text-sm font-semibold text-gold">{ranking.label}</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gold" style={{ width: `${ranking.percentile}%` }} />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{ranking.description}</p>
          <p className="mt-2 text-xs text-slate-500">
            基于 {ranking.peerCount.toLocaleString('zh-CN')} 名模拟玩家收益、年化表现与回撤控制生成动态分位。
          </p>
        </Card>
        <Card>
          <h3 className="text-lg font-bold">年度事件</h3>
          <div className="mt-3 space-y-3">
            {result.appliedEvents.map((event) => (
              <div
                key={event.id}
                className={`rounded-2xl p-3 ${
                  event.type === 'black-swan' ? 'bg-red-50 text-red-900' : 'bg-slate-50'
                }`}
              >
                <p className="font-semibold">{event.title}</p>
                <p className="mt-1 text-sm text-slate-600">{event.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function ScoreDelta({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
      <span className="font-semibold">{label}</span>
      <span className={value >= 0 ? 'text-emerald-600' : 'text-red-600'}>
        {value >= 0 ? '+' : ''}{value} → {total}
      </span>
    </div>
  )
}
