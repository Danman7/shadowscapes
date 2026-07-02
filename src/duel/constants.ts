import { DuelState } from './types'

export const INITIAL_DUAL_STATE: DuelState = {
  round: 0,
  phase: 'setup',
  playerOrder: ['', ''],
  players: {},
  cards: {},
}

export const INITIAL_PLAYER_COINS = 30
