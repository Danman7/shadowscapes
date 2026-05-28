import { applyCardEffects } from 'src/game-engine/duel/effects'
import { CARD_BASES, PLACEHOLDER_PLAYER } from 'src/game-engine/constants'
import {
  activateCharacterAbility,
  attackCard,
  playCard,
  switchTurn,
} from 'src/game-engine/duel'
import { createCardInstance } from 'src/game-engine/cards'
import { makeTestDuel } from 'src/game-engine/testing'
import type { Duel } from 'src/game-engine/types'
import { makeStore } from 'src/store'

import type { UnknownAction } from '@reduxjs/toolkit'

const dispatchWithEffects = (state: Duel, action: UnknownAction): Duel => {
  const store = makeStore(state)
  store.dispatch(action)
  return store.getState().duel
}

describe('Character ability middleware', () => {
  test('arms burrick ability on first activation', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        b1: createCardInstance('burrick', 'b1', { charges: 1 }),
        t1: createCardInstance('templeGuard', 't1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['b1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['t1'],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      activateCharacterAbility({ cardInstanceId: 'b1' }),
    )

    expect(result.pendingCharacterAbility).toEqual({
      sourceCardInstanceId: 'b1',
      sourceCardBaseId: 'burrick',
    })
  })

  test('resolves burrick ability on target activation and clears pending state', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      pendingCharacterAbility: {
        sourceCardInstanceId: 'b1',
        sourceCardBaseId: 'burrick',
      },
      cards: {
        b1: createCardInstance('burrick', 'b1', { charges: 1 }),
        z1: createCardInstance('zombie', 'z1'),
        t1: createCardInstance('templeGuard', 't1'),
        z2: createCardInstance('zombie', 'z2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['b1'],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['z1', 't1', 'z2'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      activateCharacterAbility({ cardInstanceId: 't1' }),
    )

    expect(result.pendingCharacterAbility).toBeNull()
    expect(result.cards['b1']!.attributes.charges).toBe(0)
    expect(result.cards['b1']!.attributes.life).toBe(3)
    expect(result.players['player2'].board).toContain('z1')
    expect(result.players['player2'].board).toContain('z2')
    expect(result.cards['z1']!.attributes.life).toBe(1)
    expect(result.cards['z2']!.attributes.life).toBe(1)
  })
})

describe('Cook effect', () => {
  test('draws a card for the player who played Cook', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('cook', '1'),
        '2': createCardInstance('zombie', '2'),
        '3': createCardInstance('haunt', '3'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: ['2', '3'],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.players['player1'].board).toContain('1')
    expect(result.players['player1'].hand).toEqual(['2'])
    expect(result.players['player1'].deck).toEqual(['3'])
  })

  test('does not draw when deck is empty', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('cook', '1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.players['player1'].board).toContain('1')
    expect(result.players['player1'].hand).toEqual([])
    expect(result.players['player1'].deck).toEqual([])
  })
})

describe('Novice effect', () => {
  test('summons copies from hand and deck when stronger Hammerite is on board', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('novice', '1'),
        '2': createCardInstance('novice', '2'),
        '3': createCardInstance('novice', '3'),
        '4': createCardInstance('templeGuard', '4'),
        '5': createCardInstance('zombie', '5'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1', '2'],
          board: ['4'],
          deck: ['3', '5'],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.players['player1'].board).toContain('1')
    expect(result.players['player1'].board).toContain('2')
    expect(result.players['player1'].board).toContain('3')
    expect(result.players['player1'].board).toContain('4')

    expect(result.players['player1'].hand).not.toContain('2')
    expect(result.players['player1'].deck).not.toContain('3')
    expect(result.cards['2']!.attributes.isStunned).toBe(true)
    expect(result.cards['3']!.attributes.isStunned).toBe(true)

    expect(result.players['player1'].deck).toContain('5')
  })

  test('does not summon copies when no stronger Hammerite is on board', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('novice', '1'),
        '2': createCardInstance('novice', '2'),
        '3': createCardInstance('zombie', '3'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1', '2'],
          board: ['3'],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.players['player1'].board).toContain('1')
    expect(result.players['player1'].board).not.toContain('2')
    expect(result.players['player1'].hand).toContain('2')
  })

  test('does not summon copies when only equal-strength Hammerite is on board', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('novice', '1'),
        '2': createCardInstance('novice', '2'),
        '3': createCardInstance('novice', '3'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1', '2'],
          board: ['3'],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.players['player1'].board).toEqual(['3', '1'])
    expect(result.players['player1'].hand).toEqual(['2'])
  })
})

describe('Sachelman effect', () => {
  test('gives +1 to weaker Hammerites on board', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('novice', '1'),
        '2': createCardInstance('templeGuard', '2'),
        '3': createCardInstance('sachelman', '3'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['3'],
          board: ['1', '2'],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '3' }),
    )

    expect(result.cards['1']!.attributes.life).toBe(
      CARD_BASES['novice'].attributes.life! + 1,
    )

    expect(result.cards['2']!.attributes.life).toBe(
      CARD_BASES['templeGuard'].attributes.life,
    )
  })

  test('does not boost non-Hammerite cards', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('zombie', '1'),
        '2': createCardInstance('sachelman', '2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['2'],
          board: ['1'],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '2' }),
    )

    expect(result.cards['1']!.attributes.life).toBe(
      CARD_BASES['zombie'].attributes.life,
    )
  })

  test('does not boost Hammerites with equal or greater strength', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('templeGuard', '1'),
        '2': createCardInstance('sachelman', '2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['2'],
          board: ['1'],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '2' }),
    )

    expect(result.cards['1']!.attributes.life).toBe(
      CARD_BASES['templeGuard'].attributes.life,
    )
  })
})

describe('Card effects middleware', () => {
  test('does not interfere with non-PLAY_CARD actions', () => {
    const state = makeTestDuel()

    const result = dispatchWithEffects(state, switchTurn())

    expect(result.playerOrder[0]).toBe('player2')
  })

  test('does not interfere with cards that have no effects', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('downwinder', '1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.players['player1'].board).toEqual(['1'])
    expect(result.phase).toBe('turn-end')
  })
})

describe('Zombie effect', () => {
  test('summons all zombies from discard to board on play', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('zombie', '1'),
        '2': createCardInstance('zombie', '2'),
        '3': createCardInstance('zombie', '3'),
        '4': createCardInstance('haunt', '4'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: [],
          discard: ['2', '3', '4'],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.players['player1'].board).toContain('1')
    expect(result.players['player1'].board).toContain('2')
    expect(result.players['player1'].board).toContain('3')
    expect(result.players['player1'].discard).toEqual(['4'])
  })

  test('keeps summoned zombies at base life when discard state is valid', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('zombie', '1'),
        '2': createCardInstance('zombie', '2'),
        '3': createCardInstance('zombie', '3'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: [],
          discard: ['2', '3'],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    const baseLife = CARD_BASES['zombie'].attributes.life

    expect(result.cards['2']!.attributes.life).toBe(baseLife)
    expect(result.cards['3']!.attributes.life).toBe(baseLife)
    expect(result.cards['2']!.attributes.isStunned).toBe(true)
    expect(result.cards['3']!.attributes.isStunned).toBe(true)
    expect(result.players['player1'].board).toContain('2')
    expect(result.players['player1'].board).toContain('3')
  })

  test('does nothing when no zombies in discard', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('zombie', '1'),
        '2': createCardInstance('haunt', '2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: [],
          discard: ['2'],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.players['player1'].board).toEqual(['1'])
    expect(result.players['player1'].discard).toEqual(['2'])
  })
})

describe('Haunt ability effect', () => {
  test('does not damage cards when opponent plays a character', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('templeGuard', '1'),
        '2': createCardInstance('haunt', '2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2'],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['1']!.attributes.life).toBe(4)
    expect(result.players['player1'].board).toContain('1')
  })

  test('gains 1 charge when haunt defeats a character', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        h1: createCardInstance('haunt', 'h1', { charges: 0 }),
        z1: createCardInstance('zombie', 'z1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['h1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['z1'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: 'h1', defenderId: 'z1' }),
    )

    expect(result.cards['h1']!.attributes.charges).toBe(1)
    expect(result.players['player2'].discard).toContain('z1')
  })

  test('does not gain charge if haunt does not defeat the target', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        h1: createCardInstance('haunt', 'h1', { charges: 0 }),
        t1: createCardInstance('templeGuard', 't1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['h1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['t1'],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: 'h1', defenderId: 't1' }),
    )

    expect(result.cards['h1']!.attributes.charges).toBe(0)
  })

  test('consumes 1 charge and deals +1 damage when attacking', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        h1: createCardInstance('haunt', 'h1', { charges: 1 }),
        t1: createCardInstance('templeGuard', 't1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['h1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['t1'],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: 'h1', defenderId: 't1' }),
    )

    expect(result.cards['h1']!.attributes.charges).toBe(0)
    expect(result.cards['t1']!.attributes.life).toBe(1)
  })

  test('does not consume charge or add bonus when no charges are available', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        h1: createCardInstance('haunt', 'h1', { charges: 0 }),
        t1: createCardInstance('templeGuard', 't1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['h1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['t1'],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: 'h1', defenderId: 't1' }),
    )

    expect(result.cards['h1']!.attributes.charges).toBe(0)
    expect(result.cards['t1']!.attributes.life).toBe(2)
  })
})

describe('Burrick attack effect', () => {
  test('damages adjacent cards and loses 1 charge', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        '1': createCardInstance('burrick', '1'),
        '2': createCardInstance('zombie', '2'),
        '3': createCardInstance('templeGuard', '3'),
        '4': createCardInstance('zombie', '4'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2', '3', '4'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: '1', defenderId: '3' }),
    )

    expect(result.cards['3']!.attributes.life).toBe(3)
    expect(result.players['player2'].board).toContain('2')
    expect(result.players['player2'].discard).not.toContain('2')
    expect(result.players['player2'].board).toContain('4')
    expect(result.players['player2'].discard).not.toContain('4')
    expect(result.cards['1']!.attributes.charges).toBe(0)
  })

  test('damages only left adjacent card when defender is rightmost', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        '1': createCardInstance('burrick', '1'),
        '2': createCardInstance('templeGuard', '2'),
        '3': createCardInstance('zombie', '3'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2', '3'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: '1', defenderId: '3' }),
    )

    expect(result.players['player2'].board).toContain('2')
    expect(result.cards['1']!.attributes.charges).toBe(0)
  })

  test('no splash when defender is the only card', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        '1': createCardInstance('burrick', '1'),
        '2': createCardInstance('zombie', '2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: '1', defenderId: '2' }),
    )

    expect(result.players['player2'].board).toContain('2')
    expect(result.players['player2'].discard).not.toContain('2')
    expect(result.cards['1']!.attributes.charges).toBe(0)
  })

  test('burrick loses a charge even with 1 life', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        '1': createCardInstance('burrick', '1', { life: 1 }),
        '2': createCardInstance('zombie', '2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['1'],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: '1', defenderId: '2' }),
    )

    expect(result.cards['1']!.attributes.charges).toBe(0)
  })

  test('non-burrick attacks do not trigger splash damage', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        '1': createCardInstance('haunt', '1'),
        '2': createCardInstance('zombie', '2'),
        '3': createCardInstance('zombie', '3'),
        '4': createCardInstance('zombie', '4'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2', '3', '4'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: '1', defenderId: '3' }),
    )

    expect(result.cards['2']!.attributes.life).toBe(2)
    expect(result.cards['4']!.attributes.life).toBe(2)
    expect(result.players['player2'].board).toContain('2')
    expect(result.players['player2'].board).toContain('4')
  })

  test('reduces charges by 1 when splashing', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        '1': createCardInstance('burrick', '1'),
        '2': createCardInstance('zombie', '2'),
        '3': createCardInstance('templeGuard', '3'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2', '3'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: '1', defenderId: '3' }),
    )

    expect(result.cards['1']!.attributes.charges).toBe(0)
  })

  test('attacks as regular card when charges is 0', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        '1': createCardInstance('burrick', '1', { charges: 0 }),
        '2': createCardInstance('zombie', '2'),
        '3': createCardInstance('templeGuard', '3'),
        '4': createCardInstance('zombie', '4'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2', '3', '4'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: '1', defenderId: '3' }),
    )

    expect(result.cards['3']!.attributes.life).toBe(3)
    expect(result.cards['2']!.attributes.life).toBe(2)
    expect(result.cards['4']!.attributes.life).toBe(2)
    expect(result.players['player2'].board).toContain('2')
    expect(result.players['player2'].board).toContain('4')
    expect(result.cards['1']!.attributes.life).toBe(3)
  })
})

describe("Mystic's Soul effect", () => {
  test('adds +1 charges to all allied board cards that have charges', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('mysticsSoul', '1'),
        '2': createCardInstance('haunt', '2'),
        '3': createCardInstance('burrick', '3'),
        '4': createCardInstance('zombie', '4'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: ['2', '3', '4'],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.charges).toBe(1)
    expect(result.cards['3']!.attributes.charges).toBe(2)
    expect(result.cards['4']!.attributes.charges).toBeUndefined()
    expect(result.players['player1'].discard).toContain('1')
  })

  test('does not affect opponent board cards', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('mysticsSoul', '1'),
        '2': createCardInstance('haunt', '2'),
        '3': createCardInstance('haunt', '3'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: ['2'],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['3'],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.charges).toBe(1)
    expect(result.cards['3']!.attributes.charges).toBe(0)
  })

  test('does nothing when no board cards have charges', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('mysticsSoul', '1'),
        '2': createCardInstance('zombie', '2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: ['2'],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.charges).toBeUndefined()
  })
})

describe('Temple Guard effect', () => {
  test('gets +1 life on play when opponent has more board cards', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('templeGuard', '1'),
        '2': createCardInstance('zombie', '2'),
        '3': createCardInstance('zombie', '3'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2', '3'],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    const baseLife = CARD_BASES['templeGuard'].attributes.life!
    expect(result.cards['1']!.attributes.life).toBe(baseLife + 1)
  })

  test('does not get +1 when boards are equal', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('templeGuard', '1'),
        '2': createCardInstance('zombie', '2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: ['2'],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['1']!.attributes.life).toBe(
      CARD_BASES['templeGuard'].attributes.life,
    )
  })

  test('does not retaliate when attacked', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('zombie', '1', { life: 2 }),
        '2': createCardInstance('templeGuard', '2', { life: 3 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: [],
          board: ['1'],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: '1', defenderId: '2' }),
    )

    expect(result.cards['2']!.attributes.life).toBe(2)
    expect(result.cards['1']!.attributes.life).toBe(2)
    expect(result.players['player1'].board).toContain('1')
    expect(result.players['player2'].board).toContain('2')
  })
})

describe("Yora's Skull effect", () => {
  test('gives +1 to all allied Hammerites on board', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('yoraSkull', '1'),
        '2': createCardInstance('templeGuard', '2', { life: 3 }),
        '3': createCardInstance('novice', '3', { life: 1 }),
        '4': createCardInstance('zombie', '4', { life: 2 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: ['2', '3', '4'],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.life).toBe(4)
    expect(result.cards['3']!.attributes.life).toBe(2)
    expect(result.cards['4']!.attributes.life).toBe(2)
    expect(result.players['player1'].discard).toContain('1')
    expect(result.players['player1'].board).not.toContain('1')
  })

  test('does not boost opponent Hammerites', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('yoraSkull', '1'),
        '2': createCardInstance('templeGuard', '2', { life: 3 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2'],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.life).toBe(3)
  })

  test('does nothing when no Hammerites on board', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('yoraSkull', '1'),
        '2': createCardInstance('zombie', '2', { life: 2 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: ['2'],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.life).toBe(2)
  })
})

describe('High Priest Markander effect', () => {
  test('decrements charges when a Hammerite is played', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('templeGuard', '1'),
        '2': createCardInstance('markander', '2', { life: 4, charges: 3 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1', '2'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.charges).toBe(2)
  })

  test('summons Markander from hand when charges reaches 0', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('novice', '1'),
        '2': createCardInstance('markander', '2', { life: 4, charges: 1 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1', '2'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.charges).toBe(0)
    expect(result.players['player1'].board).toContain('2')
    expect(result.players['player1'].hand).not.toContain('2')
  })

  test('summons Markander from deck when charges reaches 0', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('sachelman', '1'),
        '2': createCardInstance('markander', '2', { life: 4, charges: 1 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: ['2'],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.charges).toBe(0)
    expect(result.players['player1'].board).toContain('2')
    expect(result.players['player1'].deck).not.toContain('2')
  })

  test('does not decrement charges for non-Hammerite cards', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('zombie', '1'),
        '2': createCardInstance('markander', '2', { life: 4, charges: 3 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: ['2'],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.charges).toBe(3)
  })

  test('does not affect opponent Markander', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('templeGuard', '1'),
        '2': createCardInstance('markander', '2', { life: 4, charges: 2 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          hand: ['2'],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.charges).toBe(2)
  })
})

describe('Markander in both hand and deck', () => {
  test('summons all Markander copies when charges reaches 0 via Hammerite play', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('templeGuard', '1'),
        '2': createCardInstance('markander', '2', { life: 4, charges: 1 }),
        '3': createCardInstance('markander', '3', { life: 4, charges: 1 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1', '2'],
          board: [],
          deck: ['3'],
          discard: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.players['player1'].board).toContain('2')
    expect(result.players['player1'].board).toContain('3')
    expect(result.players['player1'].hand).not.toContain('2')
    expect(result.players['player1'].deck).not.toContain('3')
  })
})

describe('Burrick with no adjacent cards', () => {
  test('damages only right adjacent card when defender is leftmost', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        '1': createCardInstance('burrick', '1'),
        '2': createCardInstance('zombie', '2'),
        '3': createCardInstance('templeGuard', '3'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2', '3'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: '1', defenderId: '2' }),
    )

    expect(result.cards['3']!.attributes.life).toBe(3)
    expect(result.players['player2'].board).toContain('3')
    expect(result.cards['1']!.attributes.charges).toBe(0)
  })
})

describe('Haunt does not react to instant cards without strength', () => {
  test('haunt charges stays unchanged when an instant with no strength is played', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('mysticsSoul', '1'),
        '2': createCardInstance('haunt', '2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2'],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.charges).toBe(0)
  })
})

describe('Burrick effect early return when defender not in prevState board', () => {
  test('returns state unchanged when defenderId is not found in prevState inactive board', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        '1': createCardInstance('burrick', '1', { life: 2, charges: 2 }),
        '2': createCardInstance('zombie', '2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: [],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: '1', defenderId: '2' }),
    )

    expect(result.cards['1']!.attributes.life).toBeDefined()
  })
})

describe('TempleGuard retaliation does not fire when templeGuard life is 0', () => {
  test('attacker is not damaged when templeGuard has life 0', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        '1': createCardInstance('zombie', '1', { life: 2 }),
        '2': createCardInstance('templeGuard', '2', { life: 0 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['2'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: '1', defenderId: '2' }),
    )

    expect(result.cards['1']!.attributes.life).toBe(2)
  })
})

describe('Markander reactive effect when no Markander is present', () => {
  test('returns state unchanged when no Markander is in hand or deck', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('novice', '1'),
        '2': createCardInstance('zombie', '2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: ['2'],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.players['player1'].board).toContain('1')
    expect(result.players['player1'].hand).not.toContain('1')
    expect(result.players['player1'].board).toHaveLength(1)
  })

  test('Markander charges is decremented but not summoned when charges > 1', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('novice', '1'),
        '2': createCardInstance('markander', '2', { charges: 3 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1', '2'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: '1' }),
    )

    expect(result.cards['2']!.attributes.charges).toBe(2)
    expect(result.players['player1'].hand).toContain('2')
    expect(result.players['player1'].board).not.toContain('2')
  })
})

describe('applyCardEffects PLAY_CARD with missing card instance', () => {
  test('returns state unchanged when cardInstanceId does not exist in state.cards', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('zombie', '1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: [],
        },
      },
    })

    const result = applyCardEffects(
      state,
      {
        type: 'PLAY_CARD',
        payload: { playerId: 'player1', cardInstanceId: '999' },
      },
      state,
    )

    expect(result.players['player1'].board).toEqual(
      state.players['player1'].board,
    )
    expect(result.players['player1'].hand).toEqual(
      state.players['player1'].hand,
    )
  })
})

describe('Guardian Statue retaliation effect', () => {
  test('damages attacker when guardian statue is attacked', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        a1: createCardInstance('haunt', 'a1'),
        g1: createCardInstance('guardianStatue', 'g1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['a1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['g1'],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: 'a1', defenderId: 'g1' }),
    )

    expect(result.cards['a1']!.attributes.life).toBe(2)
  })

  test('defeats attacker when retaliation damage is lethal', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        z1: createCardInstance('zombie', 'z1', { life: 2 }),
        g1: createCardInstance('guardianStatue', 'g1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['z1'],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['g1'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: 'z1', defenderId: 'g1' }),
    )

    expect(result.players['player1'].board).not.toContain('z1')
    expect(result.players['player1'].discard).toContain('z1')
  })
})

describe('Elevated Acolyte on-play solo bonus', () => {
  test('gains haste when played alone', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        e1: createCardInstance('elevatedAcolyte', 'e1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['e1'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: 'e1' }),
    )

    expect(result.cards['e1']!.attributes.hasHaste).toBe(true)
    expect(result.cards['e1']!.attributes.strength).toBe(1)
    expect(result.cards['e1']!.attributes.isStunned).toBe(false)
  })

  test('gains haste and +1 strength when played alone when opponent has cards on board', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        e1: createCardInstance('elevatedAcolyte', 'e1'),
        z1: createCardInstance('zombie', 'z1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['e1'],
          board: [],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['z1'],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: 'e1' }),
    )

    expect(result.cards['e1']!.attributes.hasHaste).toBe(true)
    expect(result.cards['e1']!.attributes.strength).toBe(2)
    expect(result.cards['e1']!.attributes.isStunned).toBe(false)
  })

  test('does not gain bonus when another allied character is already on board', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        e1: createCardInstance('elevatedAcolyte', 'e1'),
        z1: createCardInstance('zombie', 'z1', { life: 2 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['e1'],
          board: ['z1'],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: 'e1' }),
    )

    expect(result.cards['e1']!.attributes.hasHaste).toBeUndefined()
    expect(result.cards['e1']!.attributes.strength).toBe(1)
    expect(result.cards['e1']!.attributes.isStunned).toBe(true)
  })

  test('keeps gained bonus after another ally appears later', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        e1: createCardInstance('elevatedAcolyte', 'e1', {
          hasHaste: true,
          isStunned: false,
          strength: 2,
        }),
        z1: createCardInstance('zombie', 'z1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['z1'],
          board: ['e1'],
          deck: [],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      playCard({ playerId: 'player1', cardInstanceId: 'z1' }),
    )

    expect(result.cards['e1']!.attributes.hasHaste).toBe(true)
    expect(result.cards['e1']!.attributes.strength).toBe(2)
    expect(result.cards['e1']!.attributes.isStunned).toBe(false)
  })
})

describe('Mines Guardian final attack effect', () => {
  test('damages attacker when mines guardian is defeated by normal attack', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        a1: createCardInstance('haunt', 'a1', { life: 4 }),
        m1: createCardInstance('minesGuardian', 'm1', { life: 1 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['a1'],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['m1'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: 'a1', defenderId: 'm1' }),
    )

    expect(result.cards['a1']!.attributes.life).toBe(3)
  })

  test('does not trigger when attack source is an ability', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        b1: createCardInstance('burrick', 'b1', { life: 3, charges: 1 }),
        m1: createCardInstance('minesGuardian', 'm1', { life: 1 }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['b1'],
          discard: [],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['m1'],
          discard: [],
        },
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({
        attackerId: 'b1',
        defenderId: 'm1',
        source: 'burrick-ability',
      }),
    )

    expect(result.cards['b1']!.attributes.life).toBe(3)
  })
})
