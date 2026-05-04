import type { Middleware } from '@reduxjs/toolkit'

import type { Duel } from 'src/game-engine/types'
import { hasCardInStack } from 'src/game-engine/utils'

import { applyCardEffects } from 'src/game-engine/duel/effects'
import {
  _applyEffects,
  _cleanupDefeatedCharacters,
  attackCard,
  playCard,
} from 'src/game-engine/duel/slice'

const hasDefeatedCharactersOnBoard = (duel: Duel): boolean => {
  return Object.values(duel.players).some((player) => {
    return hasCardInStack(player.board, duel.cards, (card) => {
      return (
        card.base.type === 'Character' &&
        card.attributes.life !== undefined &&
        card.attributes.life <= 0
      )
    })
  })
}

export const cardEffectsMiddleware: Middleware<object, { duel: Duel }> =
  (store) => (next) => (action) => {
    const prevDuel = store.getState().duel

    const result = next(action)
    let currentDuel = store.getState().duel

    if (playCard.match(action) || attackCard.match(action)) {
      const withEffects = applyCardEffects(currentDuel, action, prevDuel)

      if (withEffects !== currentDuel) {
        next(_applyEffects(withEffects))
        currentDuel = withEffects
      }
    }

    if (hasDefeatedCharactersOnBoard(currentDuel)) {
      next(_cleanupDefeatedCharacters())
    }

    return result
  }
