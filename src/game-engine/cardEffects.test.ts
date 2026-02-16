import { describe, expect, test } from 'vitest'

import { CARD_BASES } from '@/constants/cardBases'
import { createDuel } from '@/game-engine/initialization'
import { createCardInstance } from '@/game-engine/utils'
import { duelReducerWithEffects } from '@/reducers/duelReducer'
import { DEFAULT_DUEL_SETUP } from '@/test/mocks/duelSetup'

describe('Cook effect', () => {
  test('draws a card for the player who played Cook', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('cook', 1),
        2: createCardInstance('zombie', 2),
        3: createCardInstance('haunt', 3),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [2, 3],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.players.player1.board).toContain(1)
    expect(result.players.player1.hand).toEqual([2])
    expect(result.players.player1.deck).toEqual([3])
  })

  test('does not draw when deck is empty', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('cook', 1),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.players.player1.board).toContain(1)
    expect(result.players.player1.hand).toEqual([])
    expect(result.players.player1.deck).toEqual([])
  })
})

describe('Novice effect', () => {
  test('summons copies from hand and deck when stronger Hammerite is on board', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('novice', 1),
        2: createCardInstance('novice', 2),
        3: createCardInstance('novice', 3),
        4: createCardInstance('templeGuard', 4),
        5: createCardInstance('zombie', 5),
      },
      players: {
        player1: {
          hand: [1, 2],
          board: [4],
          deck: [3, 5],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.players.player1.board).toContain(1)
    expect(result.players.player1.board).toContain(2)
    expect(result.players.player1.board).toContain(3)
    expect(result.players.player1.board).toContain(4)

    expect(result.players.player1.hand).not.toContain(2)
    expect(result.players.player1.deck).not.toContain(3)

    expect(result.players.player1.deck).toContain(5)
  })

  test('does not summon copies when no stronger Hammerite is on board', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('novice', 1),
        2: createCardInstance('novice', 2),
        3: createCardInstance('zombie', 3),
      },
      players: {
        player1: {
          hand: [1, 2],
          board: [3],
          deck: [],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.players.player1.board).toContain(1)
    expect(result.players.player1.board).not.toContain(2)
    expect(result.players.player1.hand).toContain(2)
  })

  test('does not summon copies when only equal-strength Hammerite is on board', () => {
    const novice1 = createCardInstance('novice', 1)
    const novice2 = createCardInstance('novice', 2)
    const novice3 = createCardInstance('novice', 3)

    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: novice1,
        2: novice2,
        3: novice3,
      },
      players: {
        player1: {
          hand: [1, 2],
          board: [3],
          deck: [],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.players.player1.board).toEqual([3, 1])
    expect(result.players.player1.hand).toEqual([2])
  })
})

describe('Sachelman effect', () => {
  test('gives +1 to weaker Hammerites on board', () => {
    const novice = createCardInstance('novice', 1)
    const templeGuard = createCardInstance('templeGuard', 2)
    const sachelman = createCardInstance('sachelman', 3)

    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: novice,
        2: templeGuard,
        3: sachelman,
      },
      players: {
        player1: {
          hand: [3],
          board: [1, 2],
          deck: [],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 3 },
    })

    expect(result.cards[1]!.strength).toBe(
      (CARD_BASES.novice as { strength: number }).strength + 1,
    )

    expect(result.cards[2]!.strength).toBe(
      (CARD_BASES.templeGuard as { strength: number }).strength,
    )
  })

  test('does not boost non-Hammerite cards', () => {
    const zombie = createCardInstance('zombie', 1)
    const sachelman = createCardInstance('sachelman', 2)

    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: zombie,
        2: sachelman,
      },
      players: {
        player1: {
          hand: [2],
          board: [1],
          deck: [],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 2 },
    })

    expect(result.cards[1]!.strength).toBe(
      (CARD_BASES.zombie as { strength: number }).strength,
    )
  })

  test('does not boost Hammerites with equal or greater strength', () => {
    const templeGuard = createCardInstance('templeGuard', 1)
    const sachelman = createCardInstance('sachelman', 2)

    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: templeGuard,
        2: sachelman,
      },
      players: {
        player1: {
          hand: [2],
          board: [1],
          deck: [],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 2 },
    })

    expect(result.cards[1]!.strength).toBe(
      (CARD_BASES.templeGuard as { strength: number }).strength,
    )
  })
})

describe('Card effects middleware', () => {
  test('does not interfere with non-PLAY_CARD actions', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
    })

    const result = duelReducerWithEffects(state, {
      type: 'SWITCH_TURN',
    })

    expect(result.activePlayerId).toBe('player2')
  })

  test('does not interfere with cards that have no effects', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('zombie', 1),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.players.player1.board).toEqual([1])
    expect(result.phase).toBe('turn-end')
  })
})
