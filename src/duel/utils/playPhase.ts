import { getCardBase } from '../../cards'
import type { PlayCardPayload } from '../state/duelStateTypes'
import type { DuelState, PlayerId } from '../types'

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
      player.coins >= getCardBase(cardBaseId).cost,
  )
}

export const canActivePlayerPass = (state: DuelState): boolean => {
  const activePlayer = state.players[state.playerOrder[0]]

  return Boolean(
    state.phase === 'play' &&
      state.pendingPlayedCardId === null &&
      activePlayer &&
      !activePlayer.hasActedThisPhase,
  )
}

export const canActivePlayTurnComplete = (state: DuelState): boolean =>
  state.phase === 'play' &&
  Boolean(state.players[state.playerOrder[0]]?.hasActedThisPhase)

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
      getCardBase(pendingCard.baseId).type === 'instance',
  )
}

export const haveBothPlayersActed = (state: DuelState): boolean =>
  state.playerOrder.every(
    (playerId) => state.players[playerId].hasActedThisPhase,
  )
