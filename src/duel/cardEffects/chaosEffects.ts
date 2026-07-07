import {
  adjustCharacterCharges,
  attackCharacter,
  damageCharacter,
  summonCard,
} from '../state/duelSlice'
import {
  canCharacterAttack,
  getAdjacentBoardCardIds,
  isCharacterInstance,
} from '../utils'
import type { CardInstanceId, DuelState, PlayerId } from '../types'
import type { ActionEffectRegistration } from './actionEffectsMiddleware'
import { createActPassCardEffect } from './actPassEffect'
import type { CardEffectsState } from './onPlayEffect'
import { createOnPlayCardEffect } from './onPlayEffect'

const getLastDiscardedZombieId = (
  state: DuelState,
  playerId: PlayerId,
): CardInstanceId | undefined => {
  const player = state.players[playerId]

  if (!player) return undefined

  for (let index = player.discard.length - 1; index >= 0; index -= 1) {
    const cardId = player.discard[index]
    const card = state.cards[cardId]

    if (isCharacterInstance(card) && card.baseId === 'zombie') return cardId
  }

  return undefined
}

const zombieOnPlay = createOnPlayCardEffect(
  'zombie',
  ({ dispatch, getState, playerId }) => {
    const state = getState().duel
    const zombieId = getLastDiscardedZombieId(state, playerId)

    if (!zombieId) return

    dispatch(
      summonCard({ playerId, cardInstanceId: zombieId, from: 'discard' }),
    )
  },
)

const burrickAttackEffect: ActionEffectRegistration<CardEffectsState> = {
  matches: attackCharacter.match,
  run: ({ action, previousState, state, dispatch }) => {
    if (!attackCharacter.match(action)) return
    if (!canCharacterAttack(previousState.duel, action.payload)) return

    const { attackerId, defenderId } = action.payload
    const previousAttacker = previousState.duel.cards[attackerId]
    const attacker = state.duel.cards[attackerId]

    if (
      !isCharacterInstance(previousAttacker) ||
      previousAttacker.baseId !== 'burrick' ||
      !isCharacterInstance(attacker) ||
      attacker.stack !== 'board' ||
      (previousAttacker.charges ?? 0) <= 0
    ) {
      return
    }

    dispatch(
      adjustCharacterCharges({
        cardInstanceId: attackerId,
        amount: -1,
      }),
    )

    getAdjacentBoardCardIds(previousState.duel, defenderId).forEach(
      (adjacentCardId) => {
        const adjacentCard = state.duel.cards[adjacentCardId]

        if (
          !isCharacterInstance(adjacentCard) ||
          adjacentCard.stack !== 'board'
        ) {
          return
        }

        dispatch(
          damageCharacter({
            cardInstanceId: adjacentCardId,
            amount: previousAttacker.strength,
          }),
        )
      },
    )
  },
}

const burrickPassEffect = createActPassCardEffect(
  'burrick',
  ({ cardInstanceId, dispatch }) => {
    dispatch(adjustCharacterCharges({ cardInstanceId, amount: 1 }))
  },
)

export const chaosEffects = [
  zombieOnPlay,
  burrickAttackEffect,
  burrickPassEffect,
] as const
