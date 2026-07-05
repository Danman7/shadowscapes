import { createContext } from 'react'

import type { CombatCardInteractions } from '../../hooks/useCombatCardInteractions'

export const CombatInteractionContext =
  createContext<CombatCardInteractions | null>(null)
