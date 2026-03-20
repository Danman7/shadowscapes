import { PLAYER_1_DECK, PLAYER_2_DECK } from 'src/constants/testDecks'
import { createDuel, type CreateDuelParams } from 'src/reducers/helpers'

export const DEFAULT_DUEL_SETUP: CreateDuelParams = {
  players: [
    { id: 'player1', name: 'Constantine', deck: PLAYER_1_DECK },
    { id: 'player2', name: 'Garrett', deck: PLAYER_2_DECK },
  ],
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
  playerOrder: ['player1', 'player2'],
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
      discard: ['sachelman', 'yoraSkull', 'markander'],
      deck: ['cook'],
    },
  },
  logs: MOCK_LOGS,
})
