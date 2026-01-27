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

interface GameProviderProps {
  children: ReactNode
}

/**
 * GameProvider component that wraps the app and provides game state and dispatch
 */
export function GameProvider({ children }: GameProviderProps) {
  const [gameState, dispatch] = useReducer(duelReducer, initialDuelState)

  const stateValue = useMemo(() => gameState, [gameState])

  return (
    <GameStateContext.Provider value={stateValue}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  )
}

/**
 * Hook to access game state
 * Throws error if used outside GameProvider
 */
export function useGameState(): Duel {
  const context = useContext(GameStateContext)

  if (context === undefined) {
    throw new Error('useGameState must be used within GameProvider')
  }

  return context
}

/**
 * Hook to access game dispatch function
 * Throws error if used outside GameProvider
 */
export function useGameDispatch(): Dispatch<DuelAction> {
  const context = useContext(GameDispatchContext)

  if (context === null || context === undefined) {
    throw new Error('useGameDispatch must be used within GameProvider')
  }

  return context
}
