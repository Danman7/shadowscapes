import { getCardBase } from '../../../cards'
import type { DuelState, PlayerId } from '../../types'

export const isPendingPlayedCardAnInstance = (
  state: DuelState,
  playerId: PlayerId,
): boolean => {
  const pendingCardId = state.pendingPlayedCardId
  const pendingCard = pendingCardId ? state.cards[pendingCardId] : undefined

  return Boolean(
    pendingCard &&
      pendingCard.ownerId === playerId &&
      pendingCard.stack === 'board' &&
      state.players[playerId]?.board.includes(pendingCard.id) &&
      getCardBase(pendingCard.baseId).type === 'instance',
  )
}
