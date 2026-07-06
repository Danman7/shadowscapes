import { getCardBase } from '../../../cards'
import type { CardBase, CardBaseId } from '../../../cards'
import type { CardInstanceId, DuelState, PlayerId } from '../../types'
import { isCharacterInstance } from '../cardInstance/isCharacterInstance'

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
    !targetCard ||
    targetCard.stack !== 'board'
  ) {
    return false
  }

  switch (getCardTarget(pendingCard.baseId)) {
    case 'allied-character':
      return (
        targetCard.ownerId === pendingCard.ownerId &&
        isCharacterInstance(targetCard)
      )
    default:
      return false
  }
}
