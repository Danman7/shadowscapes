import { configureStore } from '@reduxjs/toolkit'

import { cardEffectsMiddleware } from 'src/game-engine/cardEffectsMiddleware'
import { duelReducer } from 'src/game-engine/duelSlice'
import type { Duel } from 'src/game-engine/types'

export const makeStore = (preloadedDuelState?: Partial<Duel>) =>
  configureStore({
    reducer: { duel: duelReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(cardEffectsMiddleware),
    ...(preloadedDuelState && {
      preloadedState: {
        duel: {
          cards: {},
          players: {},
          playerOrder: ['', ''] as [string, string],
          phase: 'intro' as const,
          logs: [],
          pendingInstant: null,
          ...preloadedDuelState,
        },
      },
    }),
  })

export const store = makeStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
