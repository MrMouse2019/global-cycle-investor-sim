import { useGameStore } from '../features/campaign-flow/gameStore'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'

export function ReviewPage() {
  const { game, advanceYear } = useGameStore()
  const result = game.lastResult

  if (!result) return null

  return (
    <Card>
      <p className="text-sm font-semibold text-gold">第 {result.year} 年复盘</p>
      <h2 className="mt-2 text-3xl font-black">这年到底是谁在坑你？</h2>
      <div className="mt-6 grid gap-4">
        {result.reviewItems.map((item) => (
          <div
            key={`${item.type}-${item.title}`}
            className={`rounded-2xl p-4 ${
              item.type === 'good'
                ? 'bg-emerald-50 text-emerald-900'
                : item.type === 'warning'
                  ? 'bg-red-50 text-red-900'
                  : 'bg-blue-50 text-blue-900'
            }`}
          >
            <p className="font-bold">{item.title}</p>
            <p className="mt-2 text-sm leading-6">{item.text}</p>
          </div>
        ))}
        {result.roastLines.map((line) => (
          <div key={line} className="rounded-2xl bg-slate-950 p-4 text-sm font-semibold leading-6 text-white">
            {line}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Button onClick={advanceYear}>
          {game.totalYears !== null && game.currentYear >= game.totalYears ? '查看最终结局' : '进入下一年推演'}
        </Button>
      </div>
    </Card>
  )
}
