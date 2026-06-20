import type { Allocation, AllocationTemplateId, MarketId, SectorId } from '../types/game'

const zeroMarketWeights: Record<MarketId, number> = {
  'a-share': 0,
  'h-share': 0,
  us: 0,
  japan: 0,
  taiwan: 0,
  korea: 0,
}

const zeroSectorWeights: Record<SectorId, number> = {
  consumer: 0,
  technology: 0,
  healthcare: 0,
  'new-energy': 0,
  metals: 0,
  financials: 0,
  defense: 0,
  agriculture: 0,
}

export const allocationTemplates: Record<AllocationTemplateId, Allocation> = {
  steady: {
    templateId: 'steady',
    investedRatio: 0.75,
    marketWeights: {
      'a-share': 0.18,
      'h-share': 0.18,
      us: 0.18,
      japan: 0.18,
      taiwan: 0.14,
      korea: 0.14,
    },
    sectorWeights: {
      consumer: 0.18,
      technology: 0.16,
      healthcare: 0.16,
      'new-energy': 0.1,
      metals: 0.1,
      financials: 0.12,
      defense: 0.09,
      agriculture: 0.09,
    },
  },
  growth: {
    templateId: 'growth',
    investedRatio: 0.95,
    marketWeights: {
      'a-share': 0.16,
      'h-share': 0.08,
      us: 0.28,
      japan: 0.04,
      taiwan: 0.26,
      korea: 0.18,
    },
    sectorWeights: {
      consumer: 0.06,
      technology: 0.36,
      healthcare: 0.1,
      'new-energy': 0.24,
      metals: 0.08,
      financials: 0.06,
      defense: 0.04,
      agriculture: 0.06,
    },
  },
  defensive: {
    templateId: 'defensive',
    investedRatio: 0.62,
    marketWeights: {
      'a-share': 0.1,
      'h-share': 0.18,
      us: 0.12,
      japan: 0.36,
      taiwan: 0.08,
      korea: 0.06,
    },
    sectorWeights: {
      consumer: 0.26,
      technology: 0.06,
      healthcare: 0.22,
      'new-energy': 0.04,
      metals: 0.08,
      financials: 0.1,
      defense: 0.14,
      agriculture: 0.1,
    },
  },
  resources: {
    templateId: 'resources',
    investedRatio: 0.82,
    marketWeights: {
      'a-share': 0.12,
      'h-share': 0.12,
      us: 0.1,
      japan: 0.12,
      taiwan: 0.14,
      korea: 0.4,
    },
    sectorWeights: {
      consumer: 0.08,
      technology: 0.1,
      healthcare: 0.06,
      'new-energy': 0.08,
      metals: 0.42,
      financials: 0.12,
      defense: 0.06,
      agriculture: 0.08,
    },
  },
  cash: {
    templateId: 'cash',
    investedRatio: 0,
    marketWeights: {
      'a-share': 0.16,
      'h-share': 0.16,
      us: 0.16,
      japan: 0.2,
      taiwan: 0.16,
      korea: 0.16,
    },
    sectorWeights: {
      consumer: 0.18,
      technology: 0.1,
      healthcare: 0.18,
      'new-energy': 0.08,
      metals: 0.08,
      financials: 0.12,
      defense: 0.14,
      agriculture: 0.12,
    },
  },
  custom: {
    templateId: 'custom',
    investedRatio: 0.75,
    marketWeights: { ...zeroMarketWeights, 'a-share': 0.2, 'h-share': 0.15, us: 0.2, japan: 0.15, taiwan: 0.15, korea: 0.15 },
    sectorWeights: { ...zeroSectorWeights, consumer: 0.15, technology: 0.2, healthcare: 0.15, 'new-energy': 0.12, metals: 0.1, financials: 0.1, defense: 0.09, agriculture: 0.09 },
  },
}

export const templateLabels: Record<AllocationTemplateId, string> = {
  steady: '稳健分散',
  growth: '成长进攻',
  defensive: '防御避险',
  resources: '周期资源',
  cash: '现金观望',
  custom: '自定义',
}
