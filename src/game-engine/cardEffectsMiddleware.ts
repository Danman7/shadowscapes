import type { Middleware } from '@reduxjs/toolkit'

import { applyCardEffects } from 'src/game-engine/cardEffects'
import { _applyEffects, attackCard, playCard } from 'src/game-engine/duelSlice'
import type { Duel } from 'src/game-engine/types'

export const cardEffectsMiddleware: Middleware<object, { duel: Duel }> =
  (store) => (next) => (action) => {
    const prevDuel = store.getState().duel

    const result = next(action)

    if (playCard.match(action) || attackCard.match(action)) {
      const newDuel = store.getState().duel
      const withEffects = applyCardEffects(newDuel, action, prevDuel)

      if (withEffects !== newDuel) {
        next(_applyEffects(withEffects))
      }
    }

    return result
  }
