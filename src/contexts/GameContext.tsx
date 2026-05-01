import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import type { Duel } from 'src/game-engine'
import {
  type AppDispatch,
  makeStore,
  useAppDispatch,
  useAppSelector,
} from 'src/store'

export const GameProvider: React.FC<{
  children: ReactNode
  preloadedState?: Partial<Duel>
}> = ({ children, preloadedState }) => {
  const reduxStore = makeStore(preloadedState)

  return <Provider store={reduxStore}>{children}</Provider>
}

export const useGameState = (): Duel => useAppSelector((state) => state.duel)
export const useGameDispatch = (): AppDispatch => useAppDispatch()
