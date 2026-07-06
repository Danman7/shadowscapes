import type { PropsWithChildren } from 'react'
import { useRef } from 'react'
import { Provider } from 'react-redux'

import { createAppStore } from '../../../redux'
import type { AppStore } from '../../../redux'
import type { DuelState } from '../../types'

export interface DuelProviderProps extends PropsWithChildren {
  preloadedState?: Partial<DuelState>
}

export const DuelProvider = ({
  children,
  preloadedState,
}: DuelProviderProps) => {
  const storeRef = useRef<AppStore | null>(null)

  if (storeRef.current === null) {
    storeRef.current = createAppStore(preloadedState)
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
