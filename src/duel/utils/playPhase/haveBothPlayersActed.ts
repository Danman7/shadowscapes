import type { DuelState } from '../../types'

export const haveBothPlayersActed = (state: DuelState): boolean =>
  state.playerOrder.every(
    (playerId) => state.players[playerId].hasActedThisPhase,
  )
