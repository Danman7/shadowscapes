import { configureStore } from '@reduxjs/toolkit'
import type { PropsWithChildren } from 'react'
import { useRef } from 'react'
import { Provider } from 'react-redux'

import { INITIAL_DUAL_STATE } from '../../constants'
import type { DuelState } from '../../types'
import { duelReducer } from '../../state'

export interface DuelProviderProps extends PropsWithChildren {
  preloadedState?: Partial<DuelState>
}

export const DuelProvider = ({
  children,
  preloadedState,
}: DuelProviderProps) => {
  const storeRef = useRef<ReturnType<typeof createDuelStore> | null>(null)

  if (storeRef.current === null) {
    storeRef.current = createDuelStore(preloadedState)
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}

function createDuelStore(preloadedState?: Partial<DuelState>) {
  return configureStore({
    reducer: {
      duel: duelReducer,
    },
    preloadedState: {
      duel: {
        ...INITIAL_DUAL_STATE,
        ...preloadedState,
      },
    },
  })
}
