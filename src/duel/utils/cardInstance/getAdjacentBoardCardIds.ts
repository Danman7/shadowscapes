import type { CardInstanceId, DuelState } from '../../types'

export const getAdjacentBoardCardIds = (
  state: DuelState,
  cardInstanceId: CardInstanceId,
): CardInstanceId[] => {
  const card = state.cards[cardInstanceId]
  const player = card ? state.players[card.ownerId] : undefined

  if (!player) return []

  const targetIndex = player.board.indexOf(cardInstanceId)

  if (targetIndex === -1) return []

  return [player.board[targetIndex - 1], player.board[targetIndex + 1]].filter(
    (adjacentCardId): adjacentCardId is CardInstanceId =>
      adjacentCardId !== undefined,
  )
}
