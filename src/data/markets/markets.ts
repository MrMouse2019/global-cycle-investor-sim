import type { Market } from '../../domain/types/game'

export const markets: Market[] = [
  {
    id: 'a-share',
    name: 'A股',
    betaTraits: ['政策驱动强', '轮动快', '情绪波动大'],
    suitableCycles: ['recovery', 'loose'],
    riskLevel: 4,
    baseVolatility: 0.2,
  },
  {
    id: 'h-share',
    name: 'H股',
    betaTraits: ['估值偏低', '流动性敏感', '内外资共振'],
    suitableCycles: ['recovery', 'loose'],
    riskLevel: 3,
    baseVolatility: 0.16,
  },
  {
    id: 'us',
    name: '美股',
    betaTraits: ['成长主导', '机构定价', '科技权重高'],
    suitableCycles: ['overheat', 'loose'],
    riskLevel: 4,
    baseVolatility: 0.18,
  },
  {
    id: 'japan',
    name: '日股',
    betaTraits: ['低波动', '出口驱动', '防御属性'],
    suitableCycles: ['stagflation', 'recession'],
    riskLevel: 2,
    baseVolatility: 0.1,
  },
  {
    id: 'taiwan',
    name: '台股',
    betaTraits: ['半导体绑定', '科技集中', '芯片周期敏感'],
    suitableCycles: ['loose', 'overheat'],
    riskLevel: 4,
    baseVolatility: 0.22,
  },
  {
    id: 'korea',
    name: '韩股',
    betaTraits: ['出口依赖', '周期属性强', '大宗联动高'],
    suitableCycles: ['recovery', 'overheat'],
    riskLevel: 5,
    baseVolatility: 0.25,
  },
]
