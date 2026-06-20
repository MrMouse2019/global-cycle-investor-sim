export function formatMoney(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

export function scoreLabel(value: number) {
  if (value >= 85) return '优秀'
  if (value >= 70) return '良好'
  if (value >= 50) return '合格'
  return '待提升'
}
