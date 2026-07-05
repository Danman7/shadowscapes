import type { DuelState } from '../../types'
import { getReadyCharacters } from './getReadyCharacters'

export const canActPlayerPass = (state: DuelState): boolean => {
  const player = state.actPlayerId
    ? state.players[state.actPlayerId]
    : undefined

  return Boolean(
    state.phase === 'act' &&
      player &&
      !player.hasActedThisPhase &&
      getReadyCharacters(state, player.id).length > 0,
  )
}
