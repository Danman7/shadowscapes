import type { DuelState } from '../../types'

export const canActivePlayerPass = (state: DuelState): boolean => {
  const activePlayer = state.players[state.playerOrder[0]]

  return Boolean(
    state.phase === 'play' &&
      state.pendingPlayedCardId === null &&
      activePlayer &&
      !activePlayer.hasActedThisPhase,
  )
}
