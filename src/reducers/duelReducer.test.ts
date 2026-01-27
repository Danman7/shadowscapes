import { describe, expect, test, beforeEach } from 'vitest'
import { duelReducer, initialDuelState } from '@/reducers/duelReducer'
import { createMockDuel, createMockPlayer } from '@/test/mocks/testHelpers'
import type { Duel, CardInstance } from '@/types'
import { PLAYER_1_DECK, PLAYER_2_DECK } from '@/constants/testDecks'

describe('initial state', () => {
  test('has placeholder duel with intro phase', () => {
    expect(initialDuelState.phase).toBe('intro')
    expect(initialDuelState.startingPlayerId).toBeNull()
  })
})

describe('START_DUEL action', () => {
  test('creates new duel with player names and decks', () => {
    const {
      players: { player1, player2 },
    } = duelReducer(initialDuelState, {
      type: 'START_DUEL',
      payload: {
        player1Name: 'Alice',
        player2Name: 'Bob',
        player1Deck: PLAYER_1_DECK,
        player2Deck: PLAYER_2_DECK,
      },
    })

    expect(player1.name).toBe('Alice')
    expect(player2.name).toBe('Bob')
    expect(player1.deckIds.length).toBeGreaterThan(0)
    expect(player2.deckIds.length).toBeGreaterThan(0)
  })

  test('sets starting player and active/inactive players', () => {
    const { startingPlayerId, activePlayerId, inactivePlayerId } = duelReducer(
      initialDuelState,
      {
        type: 'START_DUEL',
        payload: {
          player1Name: 'Alice',
          player2Name: 'Bob',
          player1Deck: PLAYER_1_DECK,
          player2Deck: PLAYER_2_DECK,
        },
      },
    )

    expect(startingPlayerId).not.toBeNull()
    expect(['player1', 'player2']).toContain(activePlayerId)
    expect(['player1', 'player2']).toContain(inactivePlayerId)
    expect(activePlayerId).not.toBe(inactivePlayerId)
  })

  test('creates card instances in cards map', () => {
    const { cards } = duelReducer(initialDuelState, {
      type: 'START_DUEL',
      payload: {
        player1Name: 'Alice',
        player2Name: 'Bob',
        player1Deck: ['zombie', 'haunt'],
        player2Deck: ['cook'],
      },
    })

    expect(Object.keys(cards).length).toBe(3)
  })
})

describe('TRANSITION_PHASE action', () => {
  test('updates phase to initial-draw', () => {
    const state = createMockDuel({ phase: 'intro' })
    const { phase } = duelReducer(state, {
      type: 'TRANSITION_PHASE',
      payload: 'initial-draw',
    })

    expect(phase).toBe('initial-draw')
  })

  test('updates phase to player-turn', () => {
    const state = createMockDuel({ phase: 'redraw' })
    const { phase } = duelReducer(state, {
      type: 'TRANSITION_PHASE',
      payload: 'player-turn',
    })

    expect(phase).toBe('player-turn')
  })
})

describe('SWITCH_TURN action', () => {
  test('switches active and inactive players', () => {
    const state = createMockDuel({
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
    })

    const { activePlayerId, inactivePlayerId } = duelReducer(state, {
      type: 'SWITCH_TURN',
    })

    expect(activePlayerId).toBe('player2')
    expect(inactivePlayerId).toBe('player1')
  })

  test('switches back when called twice', () => {
    const state = createMockDuel({
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
    })

    const result1 = duelReducer(state, { type: 'SWITCH_TURN' })
    const { activePlayerId, inactivePlayerId } = duelReducer(result1, {
      type: 'SWITCH_TURN',
    })

    expect(activePlayerId).toBe('player1')
    expect(inactivePlayerId).toBe('player2')
  })
})

describe('DRAW_CARD action', () => {
  let state: Duel

  beforeEach(() => {
    const card1: CardInstance = {
      id: 1,
      baseId: 'zombie',
      type: 'character',
      strength: 1,
    }
    const card2: CardInstance = {
      id: 2,
      baseId: 'haunt',
      type: 'character',
      strength: 2,
    }
    const card3: CardInstance = {
      id: 3,
      baseId: 'cook',
      type: 'character',
      strength: 2,
    }

    state = createMockDuel({
      cards: { 1: card1, 2: card2, 3: card3 },
      players: {
        player1: createMockPlayer('player1', {
          deckIds: [1, 2],
          handIds: [],
        }),
        player2: createMockPlayer('player2', {
          deckIds: [3],
          handIds: [],
        }),
      },
    })
  })

  test('draws card from deck to hand', () => {
    const {
      players: { player1 },
    } = duelReducer(state, {
      type: 'DRAW_CARD',
      payload: { playerId: 'player1' },
    })

    expect(player1.deckIds).toEqual([2])
    expect(player1.handIds).toEqual([1])
  })

  test('draws multiple cards sequentially', () => {
    const result1 = duelReducer(state, {
      type: 'DRAW_CARD',
      payload: { playerId: 'player1' },
    })
    const {
      players: { player1 },
    } = duelReducer(result1, {
      type: 'DRAW_CARD',
      payload: { playerId: 'player1' },
    })

    expect(player1.deckIds).toEqual([])
    expect(player1.handIds).toEqual([1, 2])
  })

  test('does not modify other player', () => {
    const {
      players: { player2 },
    } = duelReducer(state, {
      type: 'DRAW_CARD',
      payload: { playerId: 'player1' },
    })

    expect(player2.deckIds).toEqual([3])
    expect(player2.handIds).toEqual([])
  })

  describe('empty deck handling', () => {
    test('returns unchanged state when deck is empty', () => {
      const emptyDeckState = createMockDuel({
        players: {
          player1: createMockPlayer('player1', { deckIds: [], handIds: [] }),
          player2: createMockPlayer('player2'),
        },
      })

      const result = duelReducer(emptyDeckState, {
        type: 'DRAW_CARD',
        payload: { playerId: 'player1' },
      })

      expect(result).toEqual(emptyDeckState)
    })

    test('handles drawing from empty deck without errors', () => {
      const emptyDeckState = createMockDuel({
        players: {
          player1: createMockPlayer('player1', { deckIds: [] }),
          player2: createMockPlayer('player2'),
        },
      })

      expect(() => {
        duelReducer(emptyDeckState, {
          type: 'DRAW_CARD',
          payload: { playerId: 'player1' },
        })
      }).not.toThrow()
    })

    test('handles undefined card in deck array', () => {
      // Edge case: deck has undefined value (shouldn't happen in practice)
      const stateWithUndefined = createMockDuel({
        players: {
          player1: createMockPlayer('player1', {
            deckIds: [undefined as any],
            handIds: [],
          }),
          player2: createMockPlayer('player2'),
        },
      })

      const result = duelReducer(stateWithUndefined, {
        type: 'DRAW_CARD',
        payload: { playerId: 'player1' },
      })

      // When drawnCardId is undefined, state is returned unchanged
      expect(result).toEqual(stateWithUndefined)
    })
  })
})

describe('PLAY_CARD action', () => {
  let state: Duel

  beforeEach(() => {
    const characterCard: CardInstance = {
      id: 1,
      baseId: 'zombie',
      type: 'character',
      strength: 1,
    }
    const instantCard: CardInstance = {
      id: 2,
      baseId: 'bookOfAsh',
      type: 'instant',
    }

    state = createMockDuel({
      cards: { 1: characterCard, 2: instantCard },
      players: {
        player1: createMockPlayer('player1', {
          handIds: [1, 2],
          boardIds: [],
          discardIds: [],
        }),
        player2: createMockPlayer('player2'),
      },
    })
  })

  describe('character cards', () => {
    test('moves character card from hand to board', () => {
      const {
        players: { player1 },
      } = duelReducer(state, {
        type: 'PLAY_CARD',
        payload: { playerId: 'player1', cardInstanceId: 1 },
      })

      expect(player1.handIds).toEqual([2])
      expect(player1.boardIds).toEqual([1])
      expect(player1.discardIds).toEqual([])
    })

    test('character card stays on board', () => {
      const {
        players: { player1 },
      } = duelReducer(state, {
        type: 'PLAY_CARD',
        payload: { playerId: 'player1', cardInstanceId: 1 },
      })

      expect(player1.boardIds).toContain(1)
    })
  })

  describe('instant cards', () => {
    test('moves instant card from hand to discard', () => {
      const {
        players: { player1 },
      } = duelReducer(state, {
        type: 'PLAY_CARD',
        payload: { playerId: 'player1', cardInstanceId: 2 },
      })

      expect(player1.handIds).toEqual([1])
      expect(player1.boardIds).toEqual([])
      expect(player1.discardIds).toEqual([2])
    })

    test('instant card does not go to board', () => {
      const {
        players: { player1 },
      } = duelReducer(state, {
        type: 'PLAY_CARD',
        payload: { playerId: 'player1', cardInstanceId: 2 },
      })

      expect(player1.boardIds).not.toContain(2)
    })
  })

  describe('missing card handling', () => {
    test('returns unchanged state when card does not exist', () => {
      const result = duelReducer(state, {
        type: 'PLAY_CARD',
        payload: { playerId: 'player1', cardInstanceId: 999 },
      })

      expect(result).toEqual(state)
    })

    test('does not remove card from hand if card does not exist', () => {
      const result = duelReducer(state, {
        type: 'PLAY_CARD',
        payload: { playerId: 'player1', cardInstanceId: 999 },
      })

      expect(result.players.player1.handIds).toEqual([1, 2])
    })
  })

  test('does not modify other player', () => {
    const {
      players: { player2 },
    } = duelReducer(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(player2.handIds).toEqual([])
    expect(player2.boardIds).toEqual([])
  })
})

describe('DISCARD_CARD action', () => {
  let state: Duel

  beforeEach(() => {
    const card1: CardInstance = {
      id: 1,
      baseId: 'zombie',
      type: 'character',
      strength: 1,
    }
    const card2: CardInstance = {
      id: 2,
      baseId: 'haunt',
      type: 'character',
      strength: 2,
    }

    state = createMockDuel({
      cards: { 1: card1, 2: card2 },
      players: {
        player1: createMockPlayer('player1', {
          handIds: [1, 2],
          discardIds: [],
        }),
        player2: createMockPlayer('player2'),
      },
    })
  })

  test('moves card from hand to discard', () => {
    const {
      players: { player1 },
    } = duelReducer(state, {
      type: 'DISCARD_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(player1.handIds).toEqual([2])
    expect(player1.discardIds).toEqual([1])
  })

  test('discards multiple cards sequentially', () => {
    const result1 = duelReducer(state, {
      type: 'DISCARD_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })
    const {
      players: { player1 },
    } = duelReducer(result1, {
      type: 'DISCARD_CARD',
      payload: { playerId: 'player1', cardInstanceId: 2 },
    })

    expect(player1.handIds).toEqual([])
    expect(player1.discardIds).toEqual([1, 2])
  })

  test('does not modify other player', () => {
    const {
      players: { player2 },
    } = duelReducer(state, {
      type: 'DISCARD_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(player2.handIds).toEqual([])
    expect(player2.discardIds).toEqual([])
  })
})

describe('unknown action', () => {
  test('returns unchanged state for unknown action type', () => {
    const state = createMockDuel()
    const result = duelReducer(state, { type: 'UNKNOWN' } as any)

    expect(result).toEqual(state)
  })
})
