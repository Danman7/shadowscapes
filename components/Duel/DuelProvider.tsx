import { useReducer } from 'react'

import { duelReducer, initialDuelState, DuelContext } from '@/state'
import { DuelState } from '@/types'

export interface DuelProviderProps {
  children: React.ReactNode
  preloadedState?: DuelState
}

export const DuelProvider: React.FC<DuelProviderProps> = ({
  children,
  preloadedState,
}) => {
  const [state, dispatch] = useReducer(
    duelReducer,
    preloadedState || initialDuelState,
  )

  return (
    <DuelContext.Provider value={{ state, dispatch }}>
      {children}
    </DuelContext.Provider>
  )
}
