import { useContext } from 'react'

import { CombatInteractionContext } from '../components/DuelTable/CombatInteractionContext'

export const useCombatInteraction = () => {
  const context = useContext(CombatInteractionContext)

  if (!context) {
    throw new Error(
      'useCombatInteraction must be used inside CombatInteractionProvider',
    )
  }

  return context
}
