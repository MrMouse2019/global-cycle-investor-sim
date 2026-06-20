import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { scenarios } from '../../data/cycles/scenarios'
import { allocationTemplates } from '../../domain/simulation/allocationTemplates'
import { applyYearResult, createActiveExitInfo, simulateYear } from '../../domain/simulation/engine'
import type { Allocation, ExitTrigger, GameState, YearScenario } from '../../domain/types/game'
import { INITIAL_CAPITAL, SAVE_KEY } from '../../shared/constants/app'

type GameStore = {
  game: GameState
  startGame: (totalYears?: number | null) => void
  resetGame: () => void
  goToAllocation: () => void
  submitAllocation: (allocation: Allocation) => void
  goToReview: () => void
  advanceYear: () => void
  endInvestment: (reason: string, trigger?: ExitTrigger) => void
  continueInvestment: () => void
}

export function createInitialGame(options: { totalYears?: number | null } = {}): GameState {
  return {
    status: 'idle',
    currentYear: 1,
    totalYears: options.totalYears ?? null,
    initialCapital: INITIAL_CAPITAL,
    cash: INITIAL_CAPITAL,
    totalAssets: INITIAL_CAPITAL,
    peakAssets: INITIAL_CAPITAL,
    maxDrawdown: 0,
    scores: {
      marketCognition: 50,
      sectorSensitivity: 50,
      riskControl: 70,
    },
    history: [],
    flags: {
      allInYears: 0,
      concentratedYears: 0,
      cashHeavyYears: 0,
      inverseCycleYears: 0,
      highRiskEventExposureYears: 0,
    },
  }
}

export function getCurrentScenario(game: GameState): YearScenario {
  return {
    ...scenarios[(game.currentYear - 1) % scenarios.length],
    year: game.currentYear,
  }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: createInitialGame(),
      startGame: (totalYears = null) =>
        set({
          game: {
            ...createInitialGame({ totalYears }),
            status: 'briefing',
          },
        }),
      resetGame: () => set({ game: createInitialGame() }),
      goToAllocation: () =>
        set(({ game }) => ({
          game: { ...game, status: 'allocating' },
        })),
      submitAllocation: (allocation) => {
        const { game } = get()
        const scenario = getCurrentScenario(game)
        const result = simulateYear(game, scenario, allocation)
        set({ game: applyYearResult(game, result) })
      },
      goToReview: () =>
        set(({ game }) => ({
          game: { ...game, status: game.exitInfo ?? game.liquidationReason ? 'ending' : 'reviewing' },
        })),
      advanceYear: () =>
        set(({ game }) => {
          if ((game.totalYears !== null && game.currentYear >= game.totalYears) || game.exitInfo || game.liquidationReason) {
            return { game: { ...game, status: 'ending' } }
          }
          return {
            game: {
              ...game,
              currentYear: game.currentYear + 1,
              status: 'briefing',
              lastResult: undefined,
              exitPrompt: undefined,
            },
          }
        }),
      endInvestment: (reason, trigger = 'manual') =>
        set(({ game }) => ({
          game: {
            ...game,
            status: 'ending',
            exitInfo: createActiveExitInfo(game, reason, trigger),
            exitPrompt: undefined,
          },
        })),
      continueInvestment: () =>
        set(({ game }) => ({
          game: {
            ...game,
            exitPrompt: undefined,
            exitPromptDismissedYear: game.lastResult?.year ?? game.currentYear,
          },
        })),
    }),
    {
      name: SAVE_KEY,
      partialize: (state) => ({ game: state.game }),
    },
  ),
)

export const defaultAllocation = allocationTemplates.steady
