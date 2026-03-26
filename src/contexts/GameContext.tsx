import { createContext, type ReactNode, useContext, useReducer } from 'react'

import type { Duel, DuelAction } from 'src/game-engine'
import { duelReducerWithEffects, INITIAL_DUEL_STATE } from 'src/game-engine'

const GameStateContext = createContext<Duel | undefined>(undefined)
const GameDispatchContext = createContext<React.Dispatch<DuelAction> | null>(
  null,
)

export const GameProvider: React.FC<{
  children: ReactNode
  preloadedState?: Partial<Duel>
}> = ({ children, preloadedState }) => {
  const [gameState, dispatch] = useReducer(duelReducerWithEffects, {
    ...INITIAL_DUEL_STATE,
    ...preloadedState,
  })

  return (
    <GameDispatchContext.Provider value={dispatch}>
      <GameStateContext.Provider value={gameState}>
        {children}
      </GameStateContext.Provider>
    </GameDispatchContext.Provider>
  )
}

export const useGameState = (): Duel => {
  const context = useContext(GameStateContext)

  if (context === undefined)
    throw new Error('useGameState must be used within GameProvider')

  return context
}

export const useGameDispatch = (): React.Dispatch<DuelAction> => {
  const dispatch = useContext(GameDispatchContext)

  if (dispatch === null)
    throw new Error('useGameDispatch must be used within GameProvider')

  return dispatch
}
