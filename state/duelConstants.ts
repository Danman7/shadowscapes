import { DuelState } from '@/types'

export const DuelPhases = {
  Intro: 'Intro',
  InitialDraw: 'InitialDraw',
  Redraw: 'Redraw',
  PlayerTurn: 'PlayerTurn',
} as const

export const CardZones = {
  Deck: 'Deck',
  Hand: 'Hand',
  Field: 'Field',
  Discard: 'Discard',
} as const

export const INITIAL_DUEL_PLAYER_COINS = 30

export const initialDuelState: DuelState = {
  phase: DuelPhases.Intro,
  activePlayerId: 'Player1',
  cards: {},
  cardZone: {},
  zones: {
    'Player1:Deck': [],
    'Player1:Hand': [],
    'Player1:Field': [],
    'Player1:Discard': [],
    'Player2:Deck': [],
    'Player2:Hand': [],
    'Player2:Field': [],
    'Player2:Discard': [],
  },
  players: {
    Player1: {
      id: 'Player1',
      name: '',
      coins: INITIAL_DUEL_PLAYER_COINS,
    },
    Player2: {
      id: 'Player2',
      name: '',
      coins: INITIAL_DUEL_PLAYER_COINS,
    },
  },
}
