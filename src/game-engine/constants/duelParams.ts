import type { Duel, Faction, Player } from 'src/game-engine/types'

export const INITIAL_DUEL_STATE: Readonly<Duel> = {
  cards: {},
  players: {},
  playerOrder: ['', ''],
  phase: 'intro',
  logs: [],
  pendingInstant: null,
}

export const INITIAL_CARDS_TO_DRAW = 4
export const INITIAL_PLAYER_COINS = 30

export const FACTION_BORDER_COLORS: Record<Faction, string> = {
  chaos: 'border-chaos',
  order: 'border-order',
  shadow: 'border-shadow',
  neutral: 'border-neutral',
}

export const FACTION_BACKGROUND_COLORS: Record<Faction, string> = {
  chaos: 'bg-chaos',
  order: 'bg-order',
  shadow: 'bg-shadow',
  neutral: 'bg-neutral',
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
