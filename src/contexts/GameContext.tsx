import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useMemo,
  useReducer,
} from 'react'

import { duelReducer, initialDuelState } from '@/reducers/duelReducer'
import type { Duel, DuelAction } from '@/types'

const GameStateContext = createContext<Duel | undefined>(undefined)
const GameDispatchContext = createContext<Dispatch<DuelAction> | null>(null)

export const GameProvider: React.FC<{
  children: ReactNode
  preloadedState?: Partial<Duel>
}> = ({ children, preloadedState }) => {
  const [gameState, dispatch] = useReducer(
    duelReducer,
    preloadedState,
    (overrides) => ({ ...initialDuelState, ...overrides }),
  )

  const stateValue = useMemo(() => gameState, [gameState])

  return (
    <GameStateContext.Provider value={stateValue}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  )
}

export const useGameState = (): Duel => {
  const context = useContext(GameStateContext)

  if (context === undefined)
    throw new Error('useGameState must be used within GameProvider')

  return context
}

export const useGameDispatch = (): Dispatch<DuelAction> => {
  const context = useContext(GameDispatchContext)

  if (context === null || context === undefined)
    throw new Error('useGameDispatch must be used within GameProvider')

  return context
}
