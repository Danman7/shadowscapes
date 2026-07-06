import type { PlayCardPayload } from '../../state/duelStateTypes'
import type { DuelState } from '../../types'
import { hasCardEffectTarget } from './cardEffectTarget'

interface CanCardBePlayedOptions extends PlayCardPayload {
  state: DuelState
}

export const canCardBePlayed = ({
  state,
  playerId,
  cardInstanceId,
  cardBaseId,
}: CanCardBePlayedOptions): boolean => {
  if (state.phase !== 'play' || state.pendingPlayedCardId !== null) return false

  const player = state.players[playerId]
  const card = state.cards[cardInstanceId]

  return Boolean(
    playerId === state.playerOrder[0] &&
    player &&
    !player.hasActedThisPhase &&
    card &&
    card.ownerId === playerId &&
    card.baseId === cardBaseId &&
    card.stack === 'hand' &&
    player.hand.includes(cardInstanceId) &&
    player.coins >= card.cost &&
    hasCardEffectTarget(state, cardBaseId, playerId),
  )
}
