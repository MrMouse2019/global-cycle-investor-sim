import { z } from 'zod'
import type { Allocation, EventCard, GameState, Market, Sector, Stock, YearScenario } from '../types/game'

const macroCycleSchema = z.enum(['recovery', 'overheat', 'stagflation', 'recession', 'loose', 'tight'])
const marketIdSchema = z.enum(['a-share', 'h-share', 'us', 'japan', 'taiwan', 'korea'])
const sectorIdSchema = z.enum([
  'consumer',
  'technology',
  'healthcare',
  'new-energy',
  'metals',
  'financials',
  'defense',
  'agriculture',
])

export const marketSchema = z.object({
  id: marketIdSchema,
  name: z.string(),
  betaTraits: z.array(z.string()),
  suitableCycles: z.array(macroCycleSchema),
  riskLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  baseVolatility: z.number().min(0).max(1),
}) satisfies z.ZodType<Market>

export const sectorSchema = z.object({
  id: sectorIdSchema,
  name: z.string(),
  traits: z.array(z.string()),
  strongCycles: z.array(macroCycleSchema),
  weakCycles: z.array(macroCycleSchema),
  volatility: z.number().min(0).max(1),
}) satisfies z.ZodType<Sector>

export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['macro', 'region', 'sector', 'risk']),
  description: z.string(),
  affectedMarkets: z.array(marketIdSchema).optional(),
  affectedSectors: z.array(sectorIdSchema).optional(),
  returnImpact: z.number().min(-0.1).max(0.1),
  volatilityImpact: z.number().min(-0.1).max(0.1),
  reviewText: z.string(),
}) satisfies z.ZodType<EventCard>

export const yearScenarioSchema = z.object({
  year: z.number().int().min(1),
  title: z.string(),
  macroCycle: macroCycleSchema,
  cycleLabel: z.string(),
  policy: z.enum(['loose', 'neutral', 'tight']),
  riskPreference: z.enum(['high', 'medium', 'low']),
  preferredMarkets: z.array(marketIdSchema),
  preferredSectors: z.array(sectorIdSchema),
  warningSectors: z.array(sectorIdSchema),
  eventIds: z.array(z.string()),
  teachingHint: z.string(),
  summary: z.string(),
}) satisfies z.ZodType<YearScenario>

export const allocationSchema = z.object({
  investedRatio: z.number().min(0).max(2),
  marketWeights: z.record(marketIdSchema, z.number().min(0).max(1)),
  sectorWeights: z.record(sectorIdSchema, z.number().min(0).max(1)),
  templateId: z.enum(['steady', 'growth', 'defensive', 'resources', 'cash', 'custom']),
  selectedMarketId: marketIdSchema.optional(),
  selectedSectorId: sectorIdSchema.optional(),
  selectedStocks: z.array(z.string()).optional(),
}) as z.ZodType<Allocation>

export const stockSchema = z.object({
  id: z.string(),
  name: z.string(),
  marketId: marketIdSchema,
  sectorId: sectorIdSchema,
  style: z.enum(['leader', 'growth', 'cyclical', 'defensive', 'turnaround']),
  expectedReturn: z.number().min(-1).max(1),
  volatility: z.number().min(0).max(1),
  popularity: z.number().min(0).max(100),
  description: z.string(),
}) satisfies z.ZodType<Stock>

export const gameStateSchema: z.ZodType<GameState> = z.lazy(() =>
  z.object({
    status: z.enum(['idle', 'briefing', 'allocating', 'settling', 'reviewing', 'ending']),
    currentYear: z.number().int().min(1),
    totalYears: z.number().int().min(1).nullable(),
    initialCapital: z.number().positive(),
    cash: z.number().min(0),
    totalAssets: z.number().min(0),
    peakAssets: z.number().positive(),
    maxDrawdown: z.number().min(0).max(1),
    scores: z.object({
      marketCognition: z.number().min(0).max(100),
      sectorSensitivity: z.number().min(0).max(100),
      riskControl: z.number().min(0).max(100),
    }),
    history: z.array(z.any()),
    flags: z.object({
      allInYears: z.number().int().min(0),
      concentratedYears: z.number().int().min(0),
      cashHeavyYears: z.number().int().min(0),
      inverseCycleYears: z.number().int().min(0),
      highRiskEventExposureYears: z.number().int().min(0),
    }),
    lastResult: z.any().optional(),
    liquidationReason: z.string().optional(),
    exitInfo: z.any().optional(),
    exitPrompt: z.any().optional(),
    exitPromptDismissedYear: z.number().int().optional(),
  }),
)
