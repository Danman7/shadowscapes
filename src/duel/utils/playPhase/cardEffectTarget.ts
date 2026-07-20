import { getCardBase } from '../../../cards'
import type { CardBase, CardBaseId } from '../../../cards'
import type { CardInstanceId, DuelState, PlayerId } from '../../types'
import { isCharacterInstance } from '../cardInstance/isCharacterInstance'
import { getOpponentPlayerId } from '../duelMode'

const getCardTarget = (cardBaseId: CardBaseId) => {
  const cardBase: CardBase = getCardBase(cardBaseId)

  return cardBase.type === 'instance' ? cardBase.target : undefined
}

export const hasCardEffectTarget = (
  state: DuelState,
  cardBaseId: CardBaseId,
  playerId: PlayerId,
): boolean => {
  const player = state.players[playerId]

  if (!player) return false

  switch (getCardTarget(cardBaseId)) {
    case 'allied-character':
      return player.board.some((cardId) =>
        isCharacterInstance(state.cards[cardId]),
      )
    case 'discarded-character':
      return player.discard.some((cardId) =>
        isCharacterInstance(state.cards[cardId]),
      )
    case 'allied-hand-character':
      return player.hand.some((cardId) =>
        isCharacterInstance(state.cards[cardId]),
      )
    case 'enemy-board-character': {
      const opponentId = getOpponentPlayerId(state, playerId)
      const opponent = opponentId ? state.players[opponentId] : undefined

      return Boolean(
        opponent?.board.some((cardId) =>
          isCharacterInstance(state.cards[cardId]),
        ),
      )
    }
    default:
      return true
  }
}

export const isAwaitingCardEffectTarget = (state: DuelState): boolean => {
  const pendingCard = state.pendingPlayedCardId
    ? state.cards[state.pendingPlayedCardId]
    : undefined

  return Boolean(
    pendingCard?.stack === 'board' && getCardTarget(pendingCard.baseId),
  )
}

export const canCardBeEffectTarget = (
  state: DuelState,
  targetCardInstanceId: CardInstanceId,
): boolean => {
  const pendingCard = state.pendingPlayedCardId
    ? state.cards[state.pendingPlayedCardId]
    : undefined
  const targetCard = state.cards[targetCardInstanceId]

  if (
    state.phase !== 'play' ||
    !pendingCard ||
    pendingCard.stack !== 'board' ||
    !targetCard
  ) {
    return false
  }

  switch (getCardTarget(pendingCard.baseId)) {
    case 'allied-character':
      return (
        targetCard.stack === 'board' &&
        targetCard.ownerId === pendingCard.ownerId &&
        isCharacterInstance(targetCard)
      )
    case 'discarded-character': {
      const player = state.players[pendingCard.ownerId]

      return Boolean(
        player &&
          targetCard.stack === 'discard' &&
          targetCard.ownerId === pendingCard.ownerId &&
          player.discard.includes(targetCardInstanceId) &&
          isCharacterInstance(targetCard),
      )
    }
    case 'allied-hand-character': {
      const player = state.players[pendingCard.ownerId]

      return Boolean(
        player &&
          targetCard.stack === 'hand' &&
          targetCard.ownerId === pendingCard.ownerId &&
          player.hand.includes(targetCardInstanceId) &&
          isCharacterInstance(targetCard),
      )
    }
    case 'enemy-board-character': {
      const opponentId = getOpponentPlayerId(state, pendingCard.ownerId)
      const opponent = opponentId ? state.players[opponentId] : undefined

      return Boolean(
        opponent &&
          targetCard.stack === 'board' &&
          targetCard.ownerId === opponent.id &&
          opponent.board.includes(targetCardInstanceId) &&
          isCharacterInstance(targetCard),
      )
    }
    default:
      return false
  }
}
