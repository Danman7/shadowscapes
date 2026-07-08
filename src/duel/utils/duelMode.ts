import type { DuelMode, DuelState, PlayerId } from '../types'

interface TablePlayerIds {
  bottomPlayerId: PlayerId
  topPlayerId: PlayerId
}

export const isSoloRandomAiMode = (
  mode: DuelMode,
): mode is Extract<DuelMode, { type: 'solo-random-ai' }> =>
  mode.type === 'solo-random-ai'

export const isPlayerAiControlled = (
  state: DuelState,
  playerId: PlayerId,
): boolean =>
  isSoloRandomAiMode(state.mode) && state.mode.aiPlayerId === playerId

export const isPlayerHumanControlled = (
  state: DuelState,
  playerId: PlayerId,
): boolean => {
  if (!state.players[playerId]) return false

  if (state.mode.type === 'hot-seat') return true

  return state.mode.humanPlayerId === playerId
}

export const getOpponentPlayerId = (
  state: DuelState,
  playerId: PlayerId,
): PlayerId | undefined => state.playerOrder.find((id) => id !== playerId)

export const getTablePlayerIds = (state: DuelState): TablePlayerIds => {
  if (isSoloRandomAiMode(state.mode)) {
    return {
      bottomPlayerId: state.mode.humanPlayerId,
      topPlayerId: state.mode.aiPlayerId,
    }
  }

  return {
    bottomPlayerId: state.playerOrder[0],
    topPlayerId: state.playerOrder[1],
  }
}
