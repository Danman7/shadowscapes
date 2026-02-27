import { PLAYER_1_DECK, PLAYER_2_DECK } from 'src/constants/testDecks'
import {
  createDuel,
  type CreateDuelParams,
} from 'src/game-engine/initialization'

export const DEFAULT_DUEL_SETUP: CreateDuelParams = {
  player1Name: 'Constantine',
  player2Name: 'Garrett',
  player1Deck: PLAYER_1_DECK,
  player2Deck: PLAYER_2_DECK,
}

export const PRELOADED_DUEL_SETUP = createDuel(DEFAULT_DUEL_SETUP)

export const MOCK_LOGS: string[] = [
  'Garrett goes first.',
  'Constantine skipped redraw.',
  'Garrett redrew a card.',
  'Garrett played Temple Guard for 4 coins. Garrett has 26 coins left.',
  'Temple Guard attacked Constantine. Constantine has 29 coins left.',
]

export const MIXED_STACKS_DUEL = createDuel(DEFAULT_DUEL_SETUP, {
  phase: 'player-turn',
  startingPlayerId: 'player1',
  activePlayerId: 'player1',
  inactivePlayerId: 'player2',
  stackOverrides: {
    player1: {
      hand: ['zombie', 'haunt'],
      board: ['zombie', 'haunt'],
      discard: ['cook'],
      deck: ['bookOfAsh', 'burrick'],
    },
    player2: {
      hand: ['novice', 'templeGuard'],
      board: ['novice', 'templeGuard'],
      discard: ['sachelman', 'yoraSkull', 'highPriestMarkander'],
      deck: ['cook'],
    },
  },
  logs: MOCK_LOGS,
})
