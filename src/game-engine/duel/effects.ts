import type { UnknownAction } from '@reduxjs/toolkit'

import { attackCard, playCard } from 'src/game-engine/duel/slice'
import { applyCombatReactiveEffects } from 'src/game-engine/duel/effects/combatReactiveEffects'
import { applyOnPlayEffects } from 'src/game-engine/duel/effects/onPlayEffects'
import type { Duel } from 'src/game-engine/types'

export function applyCardEffects(
  state: Duel,
  action: UnknownAction,
  prevState: Duel,
): Duel {
  if (playCard.match(action)) {
    const { playerId, cardInstanceId } = action.payload

    return applyOnPlayEffects(state, playerId, cardInstanceId)
  }

  if (attackCard.match(action)) {
    const { attackerId, defenderId, source } = action.payload

    return applyCombatReactiveEffects({
      state,
      prevState,
      attackerId,
      defenderId,
      source,
    })
  }

  return state
}
