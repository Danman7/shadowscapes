import { DuelPlayer, DuelState } from './types'

export const INITIAL_DUAL_STATE: DuelState = {
  round: 0,
  phase: 'setup',
  mode: { type: 'hot-seat' },
  playerOrder: ['', ''],
  players: {},
  cards: {},
  pendingPlayedCardId: null,
  actPlayerId: null,
}

export const INITIAL_PLAYER_COINS = 30
export const INITIAL_CARDS_DRAWN = 3
export const AUTOMATED_ACTION_DELAY_MS = 1000
export const ATTACK_ANIMATION_DELAY_MS = 200
export const DEFAULT_CHARACTER_STRENGTH = 1
export const INCOME_PER_TURN = 1

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
