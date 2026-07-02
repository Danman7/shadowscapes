import { configureStore } from '@reduxjs/toolkit'
import { duelReducer } from '../duel/state/duelSlice'

export const store = configureStore({
  reducer: {
    duel: duelReducer,
  },
})

export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
