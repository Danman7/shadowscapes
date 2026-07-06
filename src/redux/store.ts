import { configureStore } from '@reduxjs/toolkit'
import { cardEffectsMiddleware } from '../duel/cardEffects'
import { INITIAL_DUAL_STATE } from '../duel/constants'
import { duelReducer } from '../duel/state/duelSlice'
import type { DuelState } from '../duel/types'

export const createAppStore = (preloadedDuelState?: Partial<DuelState>) =>
  configureStore({
    reducer: {
      duel: duelReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(cardEffectsMiddleware),
    preloadedState: preloadedDuelState
      ? {
          duel: {
            ...INITIAL_DUAL_STATE,
            ...preloadedDuelState,
          },
        }
      : undefined,
  })

export const store = createAppStore()

export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
