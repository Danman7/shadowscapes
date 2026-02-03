import type { Faction, Player } from '@/types'

export const INITIAL_CARDS_TO_DRAW = 4
export const INITIAL_PLAYER_COINS = 30

export const FACTION_COLORS: Record<Faction, string> = {
  chaos: 'bg-chaos',
  order: 'bg-order',
  shadow: 'bg-shadow',
  neutral: 'bg-foreground',
}

export const PLACEHOLDER_PLAYER: Omit<Player, 'id'> = {
  name: '',
  coins: INITIAL_PLAYER_COINS,
  deck: [],
  hand: [],
  board: [],
  discard: [],
}
