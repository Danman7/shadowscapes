import { createContext } from 'react'

import { DuelAction, DuelState } from '@/types'

export const DuelContext = createContext<
  { state: DuelState; dispatch: React.Dispatch<DuelAction> } | undefined
>(undefined)
