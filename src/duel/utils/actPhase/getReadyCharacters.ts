import type { CharacterCardInstance, DuelState, PlayerId } from '../../types'
import { isCharacterInstance } from '../cardInstance'

export const getReadyCharacters = (
  state: DuelState,
  playerId: PlayerId,
): CharacterCardInstance[] => {
  const player = state.players[playerId]

  if (!player) return []

  return player.board
    .map((cardId) => state.cards[cardId])
    .filter(
      (card): card is CharacterCardInstance =>
        isCharacterInstance(card) && card.turnsStunned === 0 && !card.didAct,
    )
}
