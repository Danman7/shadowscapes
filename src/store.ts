import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'

import { cardEffectsMiddleware } from 'src/game-engine/duel/middleware'
import { duelReducer } from 'src/game-engine/duel/slice'
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
          pendingCharacterAbility: null,
          ...preloadedDuelState,
        },
      },
    }),
  })

export const store = makeStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
