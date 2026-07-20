import { viktoriaLifeBuff } from '../../cards/bases/chaosConstants'
import {
  adjustCharacterCharges,
  adjustCharacterLife,
  attackCharacter,
  damageCharacter,
  summonCardCopy,
  summonCard,
} from '../state/duelSlice'
import {
  canCharacterAttack,
  getAdjacentBoardCardIds,
  isCharacterInstance,
} from '../utils'
import { stacks } from '../types'
import type { CardInstanceId, DuelState, PlayerId } from '../types'
import type { ActionEffectRegistration } from './actionEffectsMiddleware'
import { createActPassCardEffect } from './actPassEffect'
import type { CardEffectsState } from './onPlayEffect'
import {
  createOnPlayCardEffect,
  createOnPlayCategoryEffect,
} from './onPlayEffect'
import { createTargetedCardEffect } from './targetedCardEffect'

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

const bookOfAshTargetedEffect = createTargetedCardEffect(
  'bookOfAsh',
  ({ cardInstanceId, dispatch, getState, targetCardInstanceId }) => {
    const state = getState().duel
    const book = state.cards[cardInstanceId]
    const target = state.cards[targetCardInstanceId]

    if (!book || !isCharacterInstance(target)) return

    dispatch(
      summonCardCopy({
        playerId: book.ownerId,
        sourceCardInstanceId: targetCardInstanceId,
        life: 1,
      }),
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
      (previousAttacker.traits.charges ?? 0) <= 0
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

const viktoriaBeastOnPlay = createOnPlayCategoryEffect(
  'beast',
  ({ dispatch, getState, playerId }) => {
    const state = getState().duel
    const player = state.players[playerId]

    if (!player) return

    stacks.forEach((stack) => {
      player[stack].forEach((cardInstanceId) => {
        const card = state.cards[cardInstanceId]

        if (!isCharacterInstance(card) || card.baseId !== 'viktoriaQueen') {
          return
        }

        dispatch(
          adjustCharacterLife({
            cardInstanceId,
            amount: viktoriaLifeBuff,
            stack,
          }),
        )
      })
    })
  },
)

export const chaosEffects = [
  zombieOnPlay,
  bookOfAshTargetedEffect,
  burrickAttackEffect,
  burrickPassEffect,
  viktoriaBeastOnPlay,
] as const
