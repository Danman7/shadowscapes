import { PlayerStack } from 'src/modules/duel/types'

export const PLAYER_STACKS = [
  'deck',
  'hand',
  'board',
  'discard',
] as PlayerStack[]

export const STARTING_COINS = 30

export const STARTING_DUEL_PLAYER_PROPS = {
  coins: STARTING_COINS,
  income: 0,
  hasPerformedAction: false,
}

export const INITIAL_CARDS_DRAWN_AMOUNT = 4
