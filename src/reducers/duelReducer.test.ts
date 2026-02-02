import { describe, expect, test, beforeEach } from 'vitest'
import { duelReducer, initialDuelState } from '@/reducers/duelReducer'
import type { Duel, CardInstance } from '@/types'
import { PLAYER_1_DECK, PLAYER_2_DECK } from '@/constants/testDecks'
import {
  INITIAL_CARDS_TO_DRAW,
  PLACEHOLDER_PLAYER,
} from '@/constants/duelParams'
import { createDuel } from '@/game-engine/initialization'
import { DEFAULT_DUEL_SETUP } from '@/test/mocks/duelSetup'

test('initial state has placeholder duel with intro phase', () => {
  expect(initialDuelState.phase).toBe('intro')
  expect(initialDuelState.startingPlayerId).toBeNull()
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
    expect(player1.deck.length).toBeGreaterThan(0)
    expect(player2.deck.length).toBeGreaterThan(0)
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
    const state = createDuel(DEFAULT_DUEL_SETUP, { phase: 'intro' })
    const { phase } = duelReducer(state, {
      type: 'TRANSITION_PHASE',
      payload: 'initial-draw',
    })

    expect(phase).toBe('initial-draw')
  })

  test('updates phase to player-turn', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, { phase: 'redraw' })
    const { phase } = duelReducer(state, {
      type: 'TRANSITION_PHASE',
      payload: 'player-turn',
    })

    expect(phase).toBe('player-turn')
  })
})

describe('SWITCH_TURN action', () => {
  test('switches active and inactive players', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
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
    const state = createDuel(DEFAULT_DUEL_SETUP, {
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

    state = createDuel(DEFAULT_DUEL_SETUP, {
      cards: { 1: card1, 2: card2, 3: card3 },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          deck: [1, 2],
          hand: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          deck: [3],
          hand: [],
        },
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

    expect(player1.deck).toEqual([2])
    expect(player1.hand).toEqual([1])
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

    expect(player1.deck).toEqual([])
    expect(player1.hand).toEqual([1, 2])
  })

  test('does not modify other player', () => {
    const {
      players: { player2 },
    } = duelReducer(state, {
      type: 'DRAW_CARD',
      payload: { playerId: 'player1' },
    })

    expect(player2.deck).toEqual([3])
    expect(player2.hand).toEqual([])
  })

  describe('empty deck handling', () => {
    test('returns unchanged state when deck is empty', () => {
      const emptyDeckState = createDuel(DEFAULT_DUEL_SETUP, {
        players: {
          player1: {
            ...PLACEHOLDER_PLAYER,
            id: 'player1',
            deck: [],
            hand: [],
          },
          player2: {
            ...PLACEHOLDER_PLAYER,
            id: 'player2',
          },
        },
      })

      const result = duelReducer(emptyDeckState, {
        type: 'DRAW_CARD',
        payload: { playerId: 'player1' },
      })

      expect(result).toEqual(emptyDeckState)
    })

    test('handles drawing from empty deck without errors', () => {
      const emptyDeckState = createDuel(DEFAULT_DUEL_SETUP, {
        players: {
          player1: {
            ...PLACEHOLDER_PLAYER,
            id: 'player1',
            deck: [],
          },
          player2: {
            ...PLACEHOLDER_PLAYER,
            id: 'player2',
          },
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
      const stateWithUndefined = createDuel(DEFAULT_DUEL_SETUP, {
        players: {
          player1: {
            ...PLACEHOLDER_PLAYER,
            id: 'player1',
            deck: [undefined as any],
            hand: [],
          },
          player2: {
            ...PLACEHOLDER_PLAYER,
            id: 'player2',
          },
        },
      })

      const result = duelReducer(stateWithUndefined, {
        type: 'DRAW_CARD',
        payload: { playerId: 'player1' },
      })

      expect(result).toEqual(stateWithUndefined)
    })
  })
})

describe('INITIAL_DRAW action', () => {
  test('draws starting hands for both players and advances to redraw', () => {
    const cards: Record<number, CardInstance> = {}
    const player1Deck = [1, 2, 3, 4, 5, 6]
    const player2Deck = [7, 8, 9, 10, 11, 12]

    ;[...player1Deck, ...player2Deck].forEach((id) => {
      cards[id] = { id, baseId: 'zombie', type: 'character', strength: 1 }
    })

    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'initial-draw',
      cards,
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          deck: player1Deck,
          hand: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          deck: player2Deck,
          hand: [],
        },
      },
    })

    const result = duelReducer(state, { type: 'INITIAL_DRAW' })

    expect(result.players.player1.hand).toHaveLength(INITIAL_CARDS_TO_DRAW)
    expect(result.players.player2.hand).toHaveLength(INITIAL_CARDS_TO_DRAW)
    expect(result.players.player1.deck.length).toBe(
      player1Deck.length - INITIAL_CARDS_TO_DRAW,
    )
    expect(result.players.player2.deck.length).toBe(
      player2Deck.length - INITIAL_CARDS_TO_DRAW,
    )
    expect(result.phase).toBe('redraw')
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

    state = createDuel(DEFAULT_DUEL_SETUP, {
      cards: { 1: characterCard, 2: instantCard },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          hand: [1, 2],
          board: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
        },
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

      expect(player1.hand).toEqual([2])
      expect(player1.board).toEqual([1])
      expect(player1.discard).toEqual([])
    })

    test('character card stays on board', () => {
      const {
        players: { player1 },
      } = duelReducer(state, {
        type: 'PLAY_CARD',
        payload: { playerId: 'player1', cardInstanceId: 1 },
      })

      expect(player1.board).toContain(1)
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

      expect(player1.hand).toEqual([1])
      expect(player1.board).toEqual([])
      expect(player1.discard).toEqual([2])
    })

    test('instant card does not go to board', () => {
      const {
        players: { player1 },
      } = duelReducer(state, {
        type: 'PLAY_CARD',
        payload: { playerId: 'player1', cardInstanceId: 2 },
      })

      expect(player1.board).not.toContain(2)
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

      expect(result.players.player1.hand).toEqual([1, 2])
    })
  })

  test('does not modify other player', () => {
    const {
      players: { player2 },
    } = duelReducer(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(player2.hand).toEqual([])
    expect(player2.board).toEqual([])
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

    state = createDuel(DEFAULT_DUEL_SETUP, {
      cards: { 1: card1, 2: card2 },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          hand: [1, 2],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
        },
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

    expect(player1.hand).toEqual([2])
    expect(player1.discard).toEqual([1])
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

    expect(player1.hand).toEqual([])
    expect(player1.discard).toEqual([1, 2])
  })

  test('does not modify other player', () => {
    const {
      players: { player2 },
    } = duelReducer(state, {
      type: 'DISCARD_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(player2.hand).toEqual([])
    expect(player2.discard).toEqual([])
  })
})

describe('unknown action', () => {
  test('returns unchanged state for unknown action type', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP)
    const result = duelReducer(state, { type: 'UNKNOWN' } as any)

    expect(result).toEqual(state)
  })
})
