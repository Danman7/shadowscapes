import type { Middleware } from '@reduxjs/toolkit'

import type { Duel } from 'src/game-engine/types'
import { hasCardInStack } from 'src/game-engine/utils'

import { applyCardEffects } from 'src/game-engine/duel/effects'
import {
  _applyEffects,
  _cleanupDefeatedCharacters,
  activateCharacterAbility,
  attackCard,
  playCard,
  setPendingCharacterAbility,
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

    if (activateCharacterAbility.match(action)) {
      if (currentDuel.phase !== 'player-turn') return result

      const clickedCardId = action.payload.cardInstanceId
      const activePlayer = currentDuel.players[currentDuel.playerOrder[0]]
      const inactivePlayer = currentDuel.players[currentDuel.playerOrder[1]]
      const clickedCard = currentDuel.cards[clickedCardId]

      const canArmBurrickAbility =
        activePlayer.board.includes(clickedCardId) &&
        clickedCard?.base.id === 'burrick' &&
        clickedCard.didAct !== true &&
        clickedCard.attributes.isStunned !== true &&
        (clickedCard.attributes.charges ?? 0) > 0 &&
        inactivePlayer.board.length > 0

      if (canArmBurrickAbility) {
        store.dispatch(
          setPendingCharacterAbility({
            pendingCharacterAbility: {
              sourceCardInstanceId: clickedCardId,
              sourceCardBaseId: clickedCard.base.id,
            },
          }),
        )

        return result
      }

      const pendingCharacterAbility = currentDuel.pendingCharacterAbility
      if (
        pendingCharacterAbility !== null &&
        pendingCharacterAbility.sourceCardBaseId === 'burrick' &&
        inactivePlayer.board.includes(clickedCardId)
      ) {
        store.dispatch(
          attackCard({
            attackerId: pendingCharacterAbility.sourceCardInstanceId,
            defenderId: clickedCardId,
            source: 'burrick-ability',
          }),
        )
        store.dispatch(
          setPendingCharacterAbility({ pendingCharacterAbility: null }),
        )
        currentDuel = store.getState().duel
      }
    }

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
