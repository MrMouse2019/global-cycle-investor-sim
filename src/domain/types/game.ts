export type MacroCycle = 'recovery' | 'overheat' | 'stagflation' | 'recession' | 'loose' | 'tight'
export type Policy = 'loose' | 'neutral' | 'tight'
export type RiskPreference = 'high' | 'medium' | 'low'

export type MarketId = 'a-share' | 'h-share' | 'us' | 'japan' | 'taiwan' | 'korea'

export type SectorId =
  | 'consumer'
  | 'technology'
  | 'healthcare'
  | 'new-energy'
  | 'metals'
  | 'financials'
  | 'defense'
  | 'agriculture'

export type PlayerScores = {
  marketCognition: number
  sectorSensitivity: number
  riskControl: number
}

export type PlayerHabitFlags = {
  allInYears: number
  concentratedYears: number
  cashHeavyYears: number
  inverseCycleYears: number
  highRiskEventExposureYears: number
}

export type Market = {
  id: MarketId
  name: string
  betaTraits: string[]
  suitableCycles: MacroCycle[]
  riskLevel: 1 | 2 | 3 | 4 | 5
  baseVolatility: number
}

export type Sector = {
  id: SectorId
  name: string
  traits: string[]
  strongCycles: MacroCycle[]
  weakCycles: MacroCycle[]
  volatility: number
}

export type EventCard = {
  id: string
  title: string
  type: 'macro' | 'region' | 'sector' | 'risk' | 'black-swan'
  description: string
  affectedMarkets?: MarketId[]
  affectedSectors?: SectorId[]
  returnImpact: number
  volatilityImpact: number
  reviewText: string
}

export type YearScenario = {
  year: number
  historicalYear: number
  title: string
  macroCycle: MacroCycle
  cycleLabel: string
  policy: Policy
  riskPreference: RiskPreference
  preferredMarkets: MarketId[]
  preferredSectors: SectorId[]
  warningSectors: SectorId[]
  eventIds: string[]
  macroMainline: string
  leadingThemes: string[]
  laggingThemes: string[]
  marketCharacteristics: string
  plainLanguage: string
  monetaryPolicyDetail: string
  supplyDemandDetail: string
  marketPerformance: Partial<Record<MarketId, string>>
  teachingHint: string
  summary: string
}

export type AllocationTemplateId =
  | 'steady'
  | 'growth'
  | 'defensive'
  | 'resources'
  | 'cash'
  | 'custom'

export type Stock = {
  id: string
  name: string
  marketId: MarketId
  sectorId: SectorId
  style: 'leader' | 'growth' | 'cyclical' | 'defensive' | 'turnaround'
  expectedReturn: number
  volatility: number
  popularity: number
  description: string
}

export type StockRecommendationInput = {
  year: number
  marketId: MarketId
  sectorId: SectorId
  scenario: YearScenario
}

export type StockReturnBreakdown = {
  selectedStocks: Stock[]
  contribution: number
  averageReturn: number
  averageVolatility: number
}

export type Allocation = {
  investedRatio: number
  marketWeights: Record<MarketId, number>
  sectorWeights: Record<SectorId, number>
  templateId: AllocationTemplateId
  selectedMarketId?: MarketId
  selectedSectorId?: SectorId
  selectedStocks?: string[]
}

export type ReviewItem = {
  type: 'good' | 'warning' | 'lesson'
  title: string
  text: string
}

export type LiquidationCheck = {
  liquidated: boolean
  reason?: string
}

export type ExitType = 'passive' | 'active'
export type ExitTrigger =
  | 'cash-wipeout'
  | 'liquidation'
  | 'take-profit'
  | 'stop-loss'
  | 'manual'
  | 'threshold-prompt'

export type ExitAccountSnapshot = {
  year: number
  totalAssets: number
  cash: number
  totalReturn: number
  maxDrawdown: number
  annualReturn: number
  profitLoss: number
}

export type ExitInfo = {
  type: ExitType
  trigger: ExitTrigger
  reason: string
  snapshot: ExitAccountSnapshot
}

export type ExitPrompt = {
  trigger: 'drawdown' | 'profit'
  message: string
  snapshot: ExitAccountSnapshot
}

export type YearResult = {
  year: number
  scenario: YearScenario
  allocation: Allocation
  annualReturn: number
  profitLoss: number
  drawdown: number
  stockResult: StockReturnBreakdown
  startAssets: number
  endAssets: number
  scoreDelta: PlayerScores
  endingScores: PlayerScores
  appliedEvents: EventCard[]
  reviewItems: ReviewItem[]
  liquidation: LiquidationCheck
}

export type GameStatus = 'idle' | 'briefing' | 'allocating' | 'settling' | 'reviewing' | 'ending'

export type GameState = {
  status: GameStatus
  currentYear: number
  totalYears: number | null
  initialCapital: number
  cash: number
  totalAssets: number
  peakAssets: number
  maxDrawdown: number
  scores: PlayerScores
  history: YearResult[]
  flags: PlayerHabitFlags
  lastResult?: YearResult
  liquidationReason?: string
  exitInfo?: ExitInfo
  exitPrompt?: ExitPrompt
  exitPromptDismissedYear?: number
}

export type GameStatistics = {
  initialCapital: number
  finalAssets: number
  totalProfitLoss: number
  totalReturn: number
  annualizedReturn: number
  completedYears: number
  profitYears: number
  lossYears: number
  bestYearReturn: number
  worstYearReturn: number
  averageProfitYearReturn: number
  averageLossYearReturn: number
  maxDrawdown: number
  earlyEnded: boolean
  earlyEndReason?: string
  exitType?: ExitType
  exitTrigger?: ExitTrigger
  exitSnapshot?: ExitAccountSnapshot
}

export type PlayerPercentile = {
  topPercent: number
  percentile: number
  peerCount: number
  score: number
  label: string
  description: string
}

export type Ending = {
  id: string
  title: string
  badge: string
  description: string
  unlockedLessons: string[]
}
