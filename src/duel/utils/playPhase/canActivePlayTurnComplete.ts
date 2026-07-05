import type { DuelState } from '../../types'

export const canActivePlayTurnComplete = (state: DuelState): boolean =>
  state.phase === 'play' &&
  Boolean(state.players[state.playerOrder[0]]?.hasActedThisPhase)
