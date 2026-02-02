import { PLAYER_1_DECK, PLAYER_2_DECK } from '@/constants/testDecks'
import { createDuel, type CreateDuelParams } from '@/game-engine/initialization'

export const DEFAULT_DUEL_SETUP: CreateDuelParams = {
  player1Name: 'Constantine',
  player2Name: 'Garrett',
  player1Deck: PLAYER_1_DECK,
  player2Deck: PLAYER_2_DECK,
}

export const PRELOADED_DUEL_SETUP = createDuel(DEFAULT_DUEL_SETUP)
export const MIXED_STACKS_DUEL = createDuel(DEFAULT_DUEL_SETUP, {
  phase: 'player-turn',
  startingPlayerId: 'player1',
  activePlayerId: 'player1',
  inactivePlayerId: 'player2',
  stackOverrides: {
    player1: {
      hand: PLAYER_1_DECK.slice(0, 2),
      board: PLAYER_1_DECK.slice(2, 4),
      discard: PLAYER_1_DECK.slice(4, 6),
      deck: PLAYER_1_DECK.slice(6),
    },
    player2: {
      hand: PLAYER_2_DECK.slice(0, 2),
      board: PLAYER_2_DECK.slice(2, 4),
      discard: PLAYER_2_DECK.slice(4, 6),
      deck: PLAYER_2_DECK.slice(6),
    },
  },
})
