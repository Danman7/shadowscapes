import { DuelPlayer, DuelState } from './types'

export const INITIAL_DUAL_STATE: DuelState = {
  round: 0,
  phase: 'setup',
  playerOrder: ['', ''],
  players: {},
  cards: {},
}

export const INITIAL_PLAYER_COINS = 30
export const INITIAL_CARDS_DRAWN = 3

export const EMPTY_PLAYER: DuelPlayer = {
  id: '',
  name: '',
  coins: 0,
  income: 0,
  deck: [],
  hand: [],
  board: [],
  discard: [],
  hasActedThisPhase: false,
}
