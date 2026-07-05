import type { PropsWithChildren } from 'react'

import { useCombatCardInteractions } from '../../hooks/useCombatCardInteractions'
import { CombatInteractionContext } from './CombatInteractionContext'

export const CombatInteractionProvider = ({ children }: PropsWithChildren) => (
  <CombatInteractionContext.Provider value={useCombatCardInteractions()}>
    {children}
  </CombatInteractionContext.Provider>
)
