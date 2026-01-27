import { spyOn } from 'bun:test'
import type { Duel, Player, PlayerId, Phase } from '@/types'

/**
 * Mocks Math.random to return a specific value
 * Returns the spy so it can be restored later
 */
export function mockMathRandom(value: number): ReturnType<typeof spyOn> {
  return spyOn(Math, 'random').mockReturnValue(value)
}

/**
 * Creates a mock Player object with optional overrides
 */
export function createMockPlayer(
  id: PlayerId,
  overrides: Partial<Player> = {},
): Player {
  return {
    id,
    name: id === 'player1' ? 'Test Player 1' : 'Test Player 2',
    coins: 0,
    deckIds: [],
    handIds: [],
    boardIds: [],
    discardIds: [],
    ...overrides,
  }
}

/**
 * Creates a mock Duel object with optional overrides
 */
export function createMockDuel(overrides: Partial<Duel> = {}): Duel {
  return {
    cards: {},
    players: {
      player1: createMockPlayer('player1'),
      player2: createMockPlayer('player2'),
    },
    activePlayerId: 'player1',
    inactivePlayerId: 'player2',
    phase: 'intro' as Phase,
    startingPlayerId: null,
    ...overrides,
  }
}
