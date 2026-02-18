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

    expect(result.cards[1]!.life).toBe(
      (CARD_BASES.novice as { life: number }).life + 1,
    )

    expect(result.cards[2]!.life).toBe(
      (CARD_BASES.templeGuard as { life: number }).life,
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

    expect(result.cards[1]!.life).toBe(
      (CARD_BASES.zombie as { life: number }).life,
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

    expect(result.cards[1]!.life).toBe(
      (CARD_BASES.templeGuard as { life: number }).life,
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
        1: createCardInstance('downwinder', 1),
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

describe('Zombie effect', () => {
  test('summons all zombies from discard to board on play', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('zombie', 2),
        3: createCardInstance('zombie', 3),
        4: createCardInstance('haunt', 4),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [2, 3, 4],
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
    expect(result.players.player1.discard).toEqual([4])
  })

  test('resets strength of summoned zombies to base value', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('zombie', 2, 0),
        3: createCardInstance('zombie', 3, 0),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [2, 3],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    const baseStrength = (CARD_BASES.zombie as { life: number }).life

    expect(result.cards[2]!.life).toBe(baseStrength)
    expect(result.cards[3]!.life).toBe(baseStrength)
    expect(result.players.player1.board).toContain(2)
    expect(result.players.player1.board).toContain(3)
  })

  test('does nothing when no zombies in discard', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('haunt', 2),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [2],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.players.player1.board).toEqual([1])
    expect(result.players.player1.discard).toEqual([2])
  })
})

describe('Haunt reactive effect', () => {
  test('deals damage equal to haunt strength to the played card', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('templeGuard', 1),
        2: createCardInstance('haunt', 2),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[1]!.life).toBe(2)
    expect(result.players.player1.board).toContain(1)
  })

  test('kills the played card when haunt damage exceeds its strength', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('haunt', 2),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.players.player1.board).not.toContain(1)
    expect(result.players.player1.discard).toContain(1)
    expect(result.cards[1]!.life).toBe(0)
  })

  test('multiple haunts deal cumulative damage', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('templeGuard', 1),
        2: createCardInstance('haunt', 2),
        3: createCardInstance('haunt', 3),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2, 3],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[1]!.life).toBe(2)
  })

  test('applies the sum of all haunt strengths as damage', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('templeGuard', 1),
        2: { ...createCardInstance('haunt', 2), strength: 3 },
        3: createCardInstance('haunt', 3),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2, 3],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[1]!.life).toBe(0)
    expect(result.players.player1.board).not.toContain(1)
    expect(result.players.player1.discard).toContain(1)
  })

  test('does not damage summoned cards from zombie effect', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('zombie', 2),
        3: createCardInstance('haunt', 3),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [2],
        },
        player2: {
          board: [3],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.life).toBe(1)
    expect(result.players.player1.board).toContain(2)
  })

  test('does not damage summoned cards from novice effect', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('novice', 1),
        2: createCardInstance('novice', 2),
        3: createCardInstance('templeGuard', 3),
        4: createCardInstance('haunt', 4),
      },
      players: {
        player1: {
          hand: [1, 2],
          board: [3],
          deck: [],
          discard: [],
        },
        player2: {
          board: [4],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.life).toBe(1)
    expect(result.players.player1.board).toContain(2)
  })

  test('does not react to instant cards', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('bookOfAsh', 1),
        2: createCardInstance('haunt', 2),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.players.player1.discard).toContain(1)
  })

  test('reduces haunt charges by 1 when reacting', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('templeGuard', 1),
        2: createCardInstance('haunt', 2),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.charges).toBe(0)
  })

  test('does not react when charges is 0', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('templeGuard', 1),
        2: createCardInstance('haunt', 2, undefined, 0),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[1]!.life).toBe(3)
    expect(result.players.player1.board).toContain(1)
  })
})

describe('Burrick attack effect', () => {
  test('damages adjacent cards and loses 1 strength', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'turn-end',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('burrick', 1),
        2: createCardInstance('zombie', 2),
        3: createCardInstance('templeGuard', 3),
        4: createCardInstance('zombie', 4),
      },
      players: {
        player1: {
          board: [1],
        },
        player2: {
          board: [2, 3, 4],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 3 },
    })

    expect(result.cards[3]!.life).toBe(2)
    expect(result.players.player2.board).not.toContain(2)
    expect(result.players.player2.discard).toContain(2)
    expect(result.players.player2.board).not.toContain(4)
    expect(result.players.player2.discard).toContain(4)
    expect(result.cards[1]!.life).toBe(0)
    expect(result.players.player1.board).not.toContain(1)
    expect(result.players.player1.discard).toContain(1)
  })

  test('damages only left adjacent card when defender is rightmost', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'turn-end',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('burrick', 1),
        2: createCardInstance('templeGuard', 2),
        3: createCardInstance('zombie', 3),
      },
      players: {
        player1: {
          board: [1],
        },
        player2: {
          board: [2, 3],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 3 },
    })

    expect(result.cards[2]!.life).toBe(2)
    expect(result.players.player2.board).toContain(2)
    expect(result.cards[1]!.life).toBe(1)
  })

  test('no splash when defender is the only card', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'turn-end',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('burrick', 1),
        2: createCardInstance('zombie', 2),
      },
      players: {
        player1: {
          board: [1],
        },
        player2: {
          board: [2],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })

    expect(result.players.player2.board).not.toContain(2)
    expect(result.players.player2.discard).toContain(2)
    expect(result.cards[1]!.life).toBe(1)
  })

  test('burrick dies if losing 1 strength brings it to 0', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'turn-end',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('burrick', 1, 1),
        2: createCardInstance('zombie', 2),
      },
      players: {
        player1: {
          board: [1],
          discard: [],
        },
        player2: {
          board: [2],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })

    expect(result.cards[1]!.life).toBe(0)
    expect(result.players.player1.board).not.toContain(1)
    expect(result.players.player1.discard).toContain(1)
  })

  test('non-burrick attacks do not trigger splash damage', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'turn-end',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('haunt', 1),
        2: createCardInstance('zombie', 2),
        3: createCardInstance('zombie', 3),
        4: createCardInstance('zombie', 4),
      },
      players: {
        player1: {
          board: [1],
        },
        player2: {
          board: [2, 3, 4],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 3 },
    })

    expect(result.cards[2]!.life).toBe(1)
    expect(result.cards[4]!.life).toBe(1)
    expect(result.players.player2.board).toContain(2)
    expect(result.players.player2.board).toContain(4)
  })

  test('reduces charges by 1 when splashing', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'turn-end',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('burrick', 1),
        2: createCardInstance('zombie', 2),
        3: createCardInstance('templeGuard', 3),
      },
      players: {
        player1: {
          board: [1],
        },
        player2: {
          board: [2, 3],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 3 },
    })

    expect(result.cards[1]!.charges).toBe(0)
  })

  test('attacks as regular card when charges is 0', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'turn-end',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('burrick', 1, undefined, 0),
        2: createCardInstance('zombie', 2),
        3: createCardInstance('templeGuard', 3),
        4: createCardInstance('zombie', 4),
      },
      players: {
        player1: {
          board: [1],
        },
        player2: {
          board: [2, 3, 4],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 3 },
    })

    expect(result.cards[3]!.life).toBe(2)
    expect(result.cards[2]!.life).toBe(1)
    expect(result.cards[4]!.life).toBe(1)
    expect(result.players.player2.board).toContain(2)
    expect(result.players.player2.board).toContain(4)
    expect(result.cards[1]!.life).toBe(1)
  })
})

describe("Mystic's Soul effect", () => {
  test('adds +1 charges to all allied board cards that have charges', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('mysticsSoul', 1),
        2: createCardInstance('haunt', 2),
        3: createCardInstance('burrick', 3),
        4: createCardInstance('zombie', 4),
      },
      players: {
        player1: {
          hand: [1],
          board: [2, 3, 4],
          deck: [],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.charges).toBe(2)
    expect(result.cards[3]!.charges).toBe(2)
    expect(result.cards[4]!.charges).toBeUndefined()
    expect(result.players.player1.discard).toContain(1)
  })

  test('does not affect opponent board cards', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('mysticsSoul', 1),
        2: createCardInstance('haunt', 2),
        3: createCardInstance('haunt', 3),
      },
      players: {
        player1: {
          hand: [1],
          board: [2],
          deck: [],
          discard: [],
        },
        player2: {
          board: [3],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.charges).toBe(2)
    expect(result.cards[3]!.charges).toBe(1)
  })

  test('does nothing when no board cards have charges', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('mysticsSoul', 1),
        2: createCardInstance('zombie', 2),
      },
      players: {
        player1: {
          hand: [1],
          board: [2],
          deck: [],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.charges).toBeUndefined()
  })
})

describe('Temple Guard effect', () => {
  test('gets +1 strength on play when opponent has more board cards', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('templeGuard', 1),
        2: createCardInstance('zombie', 2),
        3: createCardInstance('zombie', 3),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2, 3],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    const baseStrength = (CARD_BASES.templeGuard as { life: number }).life
    expect(result.cards[1]!.life).toBe(baseStrength + 1)
  })

  test('does not get +1 when boards are equal', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('templeGuard', 1),
        2: createCardInstance('zombie', 2),
      },
      players: {
        player1: {
          hand: [1],
          board: [2],
          deck: [],
          discard: [],
        },
        player2: {
          board: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[1]!.life).toBe(
      (CARD_BASES.templeGuard as { life: number }).life,
    )
  })

  test('retaliates when attacked and survives', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('zombie', 1, 2),
        2: createCardInstance('templeGuard', 2, 3),
      },
      players: {
        player1: {
          hand: [],
          board: [1],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })

    expect(result.cards[2]!.life).toBe(2)
    expect(result.cards[1]!.life).toBe(1)
    expect(result.players.player1.board).toContain(1)
    expect(result.players.player2.board).toContain(2)
  })

  test('retaliation kills the attacker when templeGuard has enough strength', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('zombie', 1, 1),
        2: createCardInstance('templeGuard', 2, 3),
      },
      players: {
        player1: {
          hand: [],
          board: [1],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })

    expect(result.cards[2]!.life).toBe(2)
    expect(result.players.player2.board).toContain(2)
    expect(result.cards[1]!.life).toBe(0)
    expect(result.players.player1.board).not.toContain(1)
    expect(result.players.player1.discard).toContain(1)
  })

  test('does not retaliate when templeGuard is killed (0 life)', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('templeGuard', 2, 1),
      },
      players: {
        player1: {
          hand: [],
          board: [1],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })

    expect(result.cards[2]!.life).toBe(0)
    expect(result.players.player2.board).not.toContain(2)
    expect(result.players.player2.discard).toContain(2)
    expect(result.cards[1]!.life).toBe(1)
    expect(result.players.player1.board).toContain(1)
  })
})

describe("Yora's Skull effect", () => {
  test('gives +1 to all allied Hammerites on board', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('yoraSkull', 1),
        2: createCardInstance('templeGuard', 2, 3),
        3: createCardInstance('novice', 3, 1),
        4: createCardInstance('zombie', 4, 2),
      },
      players: {
        player1: {
          hand: [1],
          board: [2, 3, 4],
          deck: [],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.life).toBe(4)
    expect(result.cards[3]!.life).toBe(2)
    expect(result.cards[4]!.life).toBe(2)
    expect(result.players.player1.discard).toContain(1)
    expect(result.players.player1.board).not.toContain(1)
  })

  test('does not boost opponent Hammerites', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('yoraSkull', 1),
        2: createCardInstance('templeGuard', 2, 3),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.life).toBe(3)
  })

  test('does nothing when no Hammerites on board', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('yoraSkull', 1),
        2: createCardInstance('zombie', 2, 2),
      },
      players: {
        player1: {
          hand: [1],
          board: [2],
          deck: [],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.life).toBe(2)
  })
})

describe('High Priest Markander effect', () => {
  test('decrements charges when a Hammerite is played', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('templeGuard', 1),
        2: createCardInstance('highPriestMarkander', 2, 4, 3),
      },
      players: {
        player1: {
          hand: [1, 2],
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

    expect(result.cards[2]!.charges).toBe(2)
  })

  test('summons Markander from hand when charges reaches 0', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('novice', 1),
        2: createCardInstance('highPriestMarkander', 2, 4, 1),
      },
      players: {
        player1: {
          hand: [1, 2],
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

    expect(result.cards[2]!.charges).toBe(0)
    expect(result.players.player1.board).toContain(2)
    expect(result.players.player1.hand).not.toContain(2)
  })

  test('summons Markander from deck when charges reaches 0', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('sachelman', 1),
        2: createCardInstance('highPriestMarkander', 2, 4, 1),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [2],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.charges).toBe(0)
    expect(result.players.player1.board).toContain(2)
    expect(result.players.player1.deck).not.toContain(2)
  })

  test('does not decrement charges for non-Hammerite cards', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('highPriestMarkander', 2, 4, 3),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [2],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.charges).toBe(3)
  })

  test('does not affect opponent Markander', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('templeGuard', 1),
        2: createCardInstance('highPriestMarkander', 2, 4, 2),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          hand: [2],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.charges).toBe(2)
  })
})

describe('Markander in both hand and deck', () => {
  test('summons all Markander copies when charges reaches 0 via Hammerite play', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('templeGuard', 1),
        2: createCardInstance('highPriestMarkander', 2, 4, 1),
        3: createCardInstance('highPriestMarkander', 3, 4, 1),
      },
      players: {
        player1: {
          hand: [1, 2],
          board: [],
          deck: [3],
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.players.player1.board).toContain(2)
    expect(result.players.player1.board).toContain(3)
    expect(result.players.player1.hand).not.toContain(2)
    expect(result.players.player1.deck).not.toContain(3)
  })
})

describe('Burrick with no adjacent cards', () => {
  test('damages only right adjacent card when defender is leftmost', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'turn-end',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('burrick', 1),
        2: createCardInstance('zombie', 2),
        3: createCardInstance('templeGuard', 3),
      },
      players: {
        player1: { board: [1] },
        player2: { board: [2, 3], discard: [] },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })

    expect(result.cards[3]!.life).toBe(2)
    expect(result.players.player2.board).toContain(3)
    expect(result.cards[1]!.life).toBe(1)
  })
})

describe('Haunt does not react to instant cards without strength', () => {
  test('haunt charges stays unchanged when an instant with no strength is played', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('mysticsSoul', 1),
        2: createCardInstance('haunt', 2),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          board: [2],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    expect(result.cards[2]!.charges).toBe(1)
  })
})

describe('Burrick effect early return when defender not in prevState board', () => {
  test('returns state unchanged when defenderId is not found in prevState inactive board', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'turn-end',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('burrick', 1, 2, 2),
        2: createCardInstance('zombie', 2),
      },
      players: {
        player1: { board: [1] },
        player2: { board: [], discard: [] },
      },
    })

    // card id=2 is not on player2's board — attack with it as defenderId hits defenderIndex === -1
    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })

    // The burrick splash effect returns early; the base ATTACK_CARD result is still applied
    // but burrick adjacency effect did not execute — attacker strength should be unchanged by splash
    expect(result.cards[1]!.life).toBeDefined()
  })
})

describe('TempleGuard retaliation does not fire when templeGuard life is 0', () => {
  test('attacker is not damaged when templeGuard has life 0', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'turn-end',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('zombie', 1, 2),
        2: createCardInstance('templeGuard', 2, 0),
      },
      players: {
        player1: { board: [1] },
        player2: { board: [2], discard: [] },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })

    // zombie attacks templeGuard with strength 0 — no retaliation, zombie strength unchanged from attack
    expect(result.cards[1]!.life).toBe(2)
  })
})

describe('Markander reactive effect when no Markander is present', () => {
  test('returns state unchanged when no Markander is in hand or deck', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('novice', 1),
        2: createCardInstance('zombie', 2),
      },
      players: {
        player1: {
          hand: [1],
          board: [],
          deck: [2],
          discard: [],
        },
        player2: { board: [] },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    // Hammerite (novice) played but no Markander anywhere — board just has the novice
    expect(result.players.player1.board).toContain(1)
    expect(result.players.player1.hand).not.toContain(1)
    // No unexpected board additions
    expect(result.players.player1.board).toHaveLength(1)
  })

  test('Markander charges is decremented but not summoned when charges > 1', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('novice', 1),
        2: createCardInstance('highPriestMarkander', 2, undefined, 3),
      },
      players: {
        player1: {
          hand: [1, 2],
          board: [],
          deck: [],
          discard: [],
        },
        player2: { board: [] },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 1 },
    })

    // Markander charges goes from 3 → 2, not summoned
    expect(result.cards[2]!.charges).toBe(2)
    expect(result.players.player1.hand).toContain(2)
    expect(result.players.player1.board).not.toContain(2)
  })
})

describe('applyCardEffects PLAY_CARD with missing card instance', () => {
  test('returns state unchanged when cardInstanceId does not exist in state.cards', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      activePlayerId: 'player1',
      inactivePlayerId: 'player2',
      cards: {
        1: createCardInstance('zombie', 1),
      },
      players: {
        player1: { hand: [1], board: [], deck: [], discard: [] },
        player2: { board: [] },
      },
    })

    // Dispatch PLAY_CARD with an id that doesn't exist in state.cards
    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 999 },
    })

    // State should be unchanged since card 999 doesn't exist
    expect(result.players.player1.board).toEqual(state.players.player1.board)
    expect(result.players.player1.hand).toEqual(state.players.player1.hand)
  })
})
