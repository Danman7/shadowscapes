import { useReducer } from 'react'

import { DuelContext } from 'src/modules/duel/DuelContext'
import { duelReducer, initialState } from 'src/modules/duel/reducer'
import { DuelState } from 'src/modules/duel/types'

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
    preloadedState || initialState,
  )

  return (
    <DuelContext.Provider value={{ state, dispatch }}>
      {children}
    </DuelContext.Provider>
  )
}
