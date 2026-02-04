import { INITIAL_CARDS_TO_DRAW } from '@/constants/duelParams'
import { PLAYER_1_DECK, PLAYER_2_DECK } from '@/constants/testDecks'
import { createDuel } from '@/game-engine/initialization'
import { createCardInstance } from '@/game-engine/utils'
import { duelReducer, initialDuelState } from '@/reducers/duelReducer'
import {
  DEFAULT_DUEL_SETUP,
  PRELOADED_DUEL_SETUP,
} from '@/test/mocks/duelSetup'
import type { Duel } from '@/types'
import { beforeEach, describe, expect, test } from 'vitest'

test('initial state has placeholder duel with intro phase', () => {
  expect(initialDuelState.phase).toBe('intro')
  expect(initialDuelState.startingPlayerId).toBeNull()
})

test('START_DUEL action creates new duel with player names and decks', () => {
  const {
    startingPlayerId,
    activePlayerId,
    inactivePlayerId,
    players: { player1, player2 },
    cards,
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
  expect(player1.deck).toHaveLength(PLAYER_1_DECK.length)
  expect(player2.deck).toHaveLength(PLAYER_2_DECK.length)
  expect(player1.hand).toEqual([])
  expect(player2.hand).toEqual([])
  expect(player1.board).toEqual([])
  expect(player2.board).toEqual([])
  expect(player1.discard).toEqual([])
  expect(player2.discard).toEqual([])

  Object.values(cards).forEach(({ baseId }) => {
    expect([...PLAYER_1_DECK, ...PLAYER_2_DECK]).toContain(baseId)
  })

  expect(startingPlayerId).not.toBeNull()
  expect(activePlayerId).not.toBe(inactivePlayerId)
})

test('TRANSITION_PHASE action updates the phase ', () => {
  const { phase } = duelReducer(PRELOADED_DUEL_SETUP, {
    type: 'TRANSITION_PHASE',
    payload: 'initial-draw',
  })

  expect(phase).toBe('initial-draw')
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
    const card1 = createCardInstance('zombie', 1)
    const card2 = createCardInstance('haunt', 2)
    const card3 = createCardInstance('cook', 3)

    state = createDuel(DEFAULT_DUEL_SETUP, {
      cards: { 1: card1, 2: card2, 3: card3 },
      players: {
        player1: {
          deck: [1, 2],
          hand: [],
        },
        player2: {
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
        stackOverrides: {
          player1: {
            deck: [],
            hand: [],
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
        stackOverrides: {
          player1: {
            deck: [],
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
        stackOverrides: {
          player1: {
            deck: [],
            hand: [],
          },
        },
      })

      const manuallyBrokenState = {
        ...stateWithUndefined,
        players: {
          ...stateWithUndefined.players,
          player1: {
            ...stateWithUndefined.players.player1,
            deck: [undefined as any],
          },
        },
      }

      const result = duelReducer(manuallyBrokenState, {
        type: 'DRAW_CARD',
        payload: { playerId: 'player1' },
      })

      expect(result).toEqual(manuallyBrokenState)
    })
  })
})

test('INITIAL_DRAW action draws starting hands for both players and advances to redraw', () => {
  const {
    phase,
    players: { player1, player2 },
  } = duelReducer(PRELOADED_DUEL_SETUP, { type: 'INITIAL_DRAW' })

  expect(player1.hand).toHaveLength(INITIAL_CARDS_TO_DRAW)
  expect(player2.hand).toHaveLength(INITIAL_CARDS_TO_DRAW)
  expect(player1.deck.length).toBe(
    PRELOADED_DUEL_SETUP.players.player1.deck.length - INITIAL_CARDS_TO_DRAW,
  )
  expect(player2.deck.length).toBe(
    PRELOADED_DUEL_SETUP.players.player2.deck.length - INITIAL_CARDS_TO_DRAW,
  )
  expect(phase).toBe('redraw')
})

describe('PLAY_CARD action', () => {
  let state: Duel

  beforeEach(() => {
    const characterCard = createCardInstance('zombie', 1)
    const instantCard = createCardInstance('bookOfAsh', 2)

    state = createDuel(DEFAULT_DUEL_SETUP, {
      cards: { 1: characterCard, 2: instantCard },
      players: {
        player1: {
          hand: [1, 2],
          board: [],
          discard: [],
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
    const card1 = createCardInstance('zombie', 1)
    const card2 = createCardInstance('haunt', 2)

    state = createDuel(DEFAULT_DUEL_SETUP, {
      cards: { 1: card1, 2: card2 },
      players: {
        player1: {
          hand: [1, 2],
          discard: [],
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

describe('REDRAW_CARD action', () => {
  let state: Duel

  beforeEach(() => {
    const card1 = createCardInstance('zombie', 1)
    const card2 = createCardInstance('haunt', 2)
    const card3 = createCardInstance('cook', 3)

    state = createDuel(DEFAULT_DUEL_SETUP, {
      cards: { 1: card1, 2: card2, 3: card3 },
      players: {
        player1: {
          hand: [1, 2],
          deck: [3],
          discard: [],
        },
      },
    })
  })

  test('puts card at bottom of deck and draws from top', () => {
    const {
      players: { player1 },
    } = duelReducer(state, {
      type: 'REDRAW_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(player1.hand).toEqual([2, 3])
    expect(player1.deck).toEqual([1])
    expect(player1.playerReady).toBe(true)
  })

  test('handles redraw when deck is empty after adding card', () => {
    const emptyDeckState = createDuel(DEFAULT_DUEL_SETUP, {
      cards: { 1: createCardInstance('zombie', 1) },
      players: {
        player1: {
          hand: [1],
          deck: [],
        },
      },
    })

    const {
      players: { player1 },
    } = duelReducer(emptyDeckState, {
      type: 'REDRAW_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(player1.hand).toEqual([1])
    expect(player1.deck).toEqual([])
    expect(player1.playerReady).toBe(true)
  })

  test('handles multiple redraws sequentially', () => {
    const result1 = duelReducer(state, {
      type: 'REDRAW_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })
    const {
      players: { player1 },
    } = duelReducer(result1, {
      type: 'REDRAW_CARD',
      payload: { playerId: 'player1', cardInstanceId: 2 },
    })

    expect(player1.hand).toEqual([3, 1])
    expect(player1.deck).toEqual([2])
    expect(player1.playerReady).toBe(true)
  })

  test('does not modify other player', () => {
    const {
      players: { player2 },
    } = duelReducer(state, {
      type: 'REDRAW_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(player2.hand).toEqual(state.players.player2.hand)
    expect(player2.deck).toEqual(state.players.player2.deck)
  })

  test('sets playerReady to true after redraw', () => {
    const {
      players: { player1 },
    } = duelReducer(state, {
      type: 'REDRAW_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(player1.playerReady).toBe(true)
  })
})

test('PLAYER_READY action updates the player ', () => {
  const {
    players: { player1 },
  } = duelReducer(PRELOADED_DUEL_SETUP, {
    type: 'PLAYER_READY',
    payload: { playerId: 'player1' },
  })

  expect(player1.playerReady).toBe(true)
})

describe('unknown action', () => {
  test('returns unchanged state for unknown action type', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP)
    const result = duelReducer(state, { type: 'UNKNOWN' } as any)

    expect(result).toEqual(state)
  })
})
