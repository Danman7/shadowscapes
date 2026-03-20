import {
  createContext,
  type ReactNode,
  useContext,
  useState,
  useSyncExternalStore,
} from 'react'

import { initialDuelState } from 'src/game-engine/duelReducer'
import { GameModel } from 'src/game-engine/GameModel'
import type { Duel, DuelAction } from 'src/types'

const GameStateContext = createContext<Duel | undefined>(undefined)
const GameModelContext = createContext<GameModel | null>(null)

export const GameProvider: React.FC<{
  children: ReactNode
  preloadedState?: Partial<Duel>
}> = ({ children, preloadedState }) => {
  const [model] = useState(
    () => new GameModel({ ...initialDuelState, ...preloadedState }),
  )

  const gameState = useSyncExternalStore(model.subscribe, model.getState)

  return (
    <GameModelContext.Provider value={model}>
      <GameStateContext.Provider value={gameState}>
        {children}
      </GameStateContext.Provider>
    </GameModelContext.Provider>
  )
}

export const useGameState = (): Duel => {
  const context = useContext(GameStateContext)

  if (context === undefined)
    throw new Error('useGameState must be used within GameProvider')

  return context
}

export const useGameDispatch = (): ((action: DuelAction) => void) => {
  const model = useContext(GameModelContext)

  if (model === null)
    throw new Error('useGameDispatch must be used within GameProvider')

  return model.dispatch
}

export const useGameModel = (): GameModel => {
  const model = useContext(GameModelContext)

  if (model === null)
    throw new Error('useGameModel must be used within GameProvider')

  return model
}
