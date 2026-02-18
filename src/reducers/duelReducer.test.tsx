import { beforeEach, describe, expect, test } from 'vitest'

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

test('TRANSITION_PHASE action updates the phase and resets playerReady flags', () => {
  const {
    phase,
    players: { player1, player2 },
  } = duelReducer(
    {
      ...PRELOADED_DUEL_SETUP,
      players: {
        player1: { ...PRELOADED_DUEL_SETUP.players.player1, playerReady: true },
        player2: { ...PRELOADED_DUEL_SETUP.players.player2, playerReady: true },
      },
    },
    {
      type: 'TRANSITION_PHASE',
      payload: 'initial-draw',
    },
  )

  expect(phase).toBe('initial-draw')
  expect(player1.playerReady).toBe(false)
  expect(player2.playerReady).toBe(false)
})

test('TRANSITION_PHASE redraw to player-turn draws one card for active player', () => {
  const state = createDuel(DEFAULT_DUEL_SETUP, {
    phase: 'redraw',
    activePlayerId: 'player1',
    inactivePlayerId: 'player2',
    stackOverrides: {
      player1: {
        hand: ['zombie'],
        deck: ['haunt', 'cook'],
      },
    },
  })

  const {
    phase,
    players: { player1 },
  } = duelReducer(state, {
    type: 'TRANSITION_PHASE',
    payload: 'player-turn',
  })

  expect(phase).toBe('player-turn')
  expect(player1.hand).toHaveLength(2)
  expect(player1.deck).toHaveLength(1)
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

  test('draws one card for the new active player', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      stackOverrides: {
        player2: {
          hand: ['cook'],
          deck: ['haunt', 'zombie'],
        },
      },
    })

    const {
      players: { player2 },
    } = duelReducer(state, {
      type: 'SWITCH_TURN',
    })

    expect(player2.hand).toHaveLength(2)
    expect(player2.deck).toHaveLength(1)
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

  test('moves character card from hand to board', () => {
    const {
      players: { player1 },
      cards,
      phase,
    } = duelReducer(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(player1.hand).toEqual([2])
    expect(player1.board).toEqual([1])
    expect(player1.discard).toEqual([])
    expect(player1.coins).toBe(state.players.player1.coins - cards[1]!.cost)
    expect(phase).toBe('turn-end')
  })

  test('moves instant card from hand to discard', () => {
    const {
      players: { player1 },
      cards,
      phase,
    } = duelReducer(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 2 },
    })

    expect(player1.hand).toEqual([1])
    expect(player1.board).toEqual([])
    expect(player1.discard).toEqual([2])
    expect(player1.coins).toBe(state.players.player1.coins - cards[2]!.cost)
    expect(phase).toBe('turn-end')
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

describe('SKIP_REDRAW', () => {
  test('sets playerReady to true and appends a ready log', () => {
    const state = {
      ...PRELOADED_DUEL_SETUP,
      phase: 'redraw' as const,
      logs: [],
      players: {
        ...PRELOADED_DUEL_SETUP.players,
        player1: {
          ...PRELOADED_DUEL_SETUP.players.player1,
          playerReady: false,
        },
      },
    }

    const result = duelReducer(state, {
      type: 'SKIP_REDRAW',
      payload: { playerId: 'player1' },
    })

    expect(result.players.player1.playerReady).toBe(true)
    expect(result.logs).toContain(
      `${state.players.player1.name} skipped redraw.`,
    )
  })

  test('does not duplicate logs when already ready', () => {
    const state = {
      ...PRELOADED_DUEL_SETUP,
      phase: 'redraw' as const,
      logs: [],
      players: {
        ...PRELOADED_DUEL_SETUP.players,
        player1: {
          ...PRELOADED_DUEL_SETUP.players.player1,
          playerReady: false,
        },
      },
    }

    const result1 = duelReducer(state, {
      type: 'SKIP_REDRAW',
      payload: { playerId: 'player1' },
    })
    const result2 = duelReducer(result1, {
      type: 'SKIP_REDRAW',
      payload: { playerId: 'player1' },
    })

    expect(result2.logs).toHaveLength(1)
  })
})

describe('ATTACK_CARD', () => {
  test('damages defender and marks attacker as acted', () => {
    const state: Duel = {
      ...PRELOADED_DUEL_SETUP,
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('haunt', 2),
      },
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      players: {
        ...PRELOADED_DUEL_SETUP.players,
        player1: {
          ...PRELOADED_DUEL_SETUP.players.player1,
          board: [1],
        },
        player2: {
          ...PRELOADED_DUEL_SETUP.players.player2,
          board: [2],
        },
      },
    }

    const result = duelReducer(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })

    expect(result.cards[1]!.didAct).toBe(true)
    expect(result.cards[2]!.life).toBe(2)
  })

  test('destroys defender when damage exceeds strength', () => {
    const state: Duel = {
      ...PRELOADED_DUEL_SETUP,
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('zombie', 2),
      },
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      players: {
        ...PRELOADED_DUEL_SETUP.players,
        player1: {
          ...PRELOADED_DUEL_SETUP.players.player1,
          board: [1],
        },
        player2: {
          ...PRELOADED_DUEL_SETUP.players.player2,
          board: [2],
          discard: [],
        },
      },
    }

    const result = duelReducer(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })

    expect(result.players.player2.board).not.toContain(2)
    expect(result.players.player2.discard).toContain(2)
  })

  test('attacker does not take retaliation damage automatically', () => {
    const state: Duel = {
      ...PRELOADED_DUEL_SETUP,
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('haunt', 2),
      },
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      players: {
        ...PRELOADED_DUEL_SETUP.players,
        player1: {
          ...PRELOADED_DUEL_SETUP.players.player1,
          board: [1],
          discard: [],
        },
        player2: {
          ...PRELOADED_DUEL_SETUP.players.player2,
          board: [2],
        },
      },
    }

    const result = duelReducer(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })

    expect(result.players.player1.board).toContain(1)
    expect(result.players.player1.discard).not.toContain(1)
    expect(result.cards[1]!.strength).toBe(1)
    expect(result.cards[2]!.life).toBe(2)
  })
})

describe('ATTACK_PLAYER', () => {
  test('reduces inactive player coins and marks attacker as acted', () => {
    const state: Duel = {
      ...PRELOADED_DUEL_SETUP,
      cards: {
        1: createCardInstance('zombie', 1),
      },
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      players: {
        ...PRELOADED_DUEL_SETUP.players,
        player1: {
          ...PRELOADED_DUEL_SETUP.players.player1,
          board: [1],
        },
        player2: {
          ...PRELOADED_DUEL_SETUP.players.player2,
          coins: 5,
          board: [],
        },
      },
    }

    const result = duelReducer(state, {
      type: 'ATTACK_PLAYER',
      payload: { attackerId: 1 },
    })

    expect(result.cards[1]!.didAct).toBe(true)
    expect(result.players.player2.coins).toBe(4)
  })

  test('does not reduce coins below zero', () => {
    const state: Duel = {
      ...PRELOADED_DUEL_SETUP,
      cards: {
        1: createCardInstance('zombie', 1),
      },
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      players: {
        ...PRELOADED_DUEL_SETUP.players,
        player1: {
          ...PRELOADED_DUEL_SETUP.players.player1,
          board: [1],
        },
        player2: {
          ...PRELOADED_DUEL_SETUP.players.player2,
          coins: 0,
          board: [],
        },
      },
    }

    const result = duelReducer(state, {
      type: 'ATTACK_PLAYER',
      payload: { attackerId: 1 },
    })

    expect(result.players.player2.coins).toBe(0)
  })
})

describe('SWITCH_TURN', () => {
  test('resets didAct flags on all cards', () => {
    const state: Duel = {
      ...PRELOADED_DUEL_SETUP,
      cards: {
        1: { ...createCardInstance('zombie', 1), didAct: true },
        2: { ...createCardInstance('haunt', 2), didAct: true },
      },
    }

    const result = duelReducer(state, { type: 'SWITCH_TURN' })

    expect(result.cards[1]!.didAct).toBe(false)
    expect(result.cards[2]!.didAct).toBe(false)
  })
})

describe('unknown action', () => {
  test('returns unchanged state for unknown action type', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP)
    const result = duelReducer(state, { type: 'UNKNOWN' } as any)

    expect(result).toEqual(state)
  })
})
