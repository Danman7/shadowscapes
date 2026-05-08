import type { Duel, Faction, Player } from 'src/game-engine/types'

export const INITIAL_DUEL_STATE: Readonly<Duel> = {
  cards: {},
  players: {},
  playerOrder: ['', ''],
  phase: 'intro',
  logs: [],
  pendingInstant: null,
  pendingCharacterAbility: null,
}

export const PLAYER_1_INITIAL_HAND = 4
export const PLAYER_2_INITIAL_HAND = 5
export const PLAYER_2_SKIP_FIRST_DRAW = true
export const INITIAL_PLAYER_COINS = 30
export const PLAYER_2_STARTING_COIN_BONUS = 0

// Kept for backwards compatibility with existing imports.
export const INITIAL_CARDS_TO_DRAW = PLAYER_1_INITIAL_HAND
export const SECOND_PLAYER_COIN_BONUS = PLAYER_2_STARTING_COIN_BONUS

export const FACTION_BORDER_COLORS: Record<Faction, string> = {
  chaos: 'border-chaos',
  order: 'border-order',
  shadow: 'border-shadow',
  neutral: 'border-foreground',
}

export const PLACEHOLDER_PLAYER: Omit<Player, 'id'> = {
  name: '',
  coins: INITIAL_PLAYER_COINS,
  playerReady: false,
  deck: [],
  hand: [],
  board: [],
  discard: [],
}

export const ATTACK_ANIMATION_MS = 350
