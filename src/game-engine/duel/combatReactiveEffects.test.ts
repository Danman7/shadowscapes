import type { UnknownAction } from '@reduxjs/toolkit'

import { CARD_BASES } from 'src/game-engine/constants'
import { attackCard, playCard } from 'src/game-engine/duel'
import { applyCombatReactiveEffects } from 'src/game-engine/duel/effects/combatReactiveEffects'
import { _cleanupDefeatedCharacters } from 'src/game-engine/duel/slice'
import {
  makeTestCard,
  makeTestDuel,
  makeTestPlayer,
} from 'src/game-engine/testing'
import type { CardAttributes, CardBaseId, Duel } from 'src/game-engine/types'
import { makeStore } from 'src/store'

const testCard = (
  baseId: CardBaseId,
  id: string,
  attributes?: Partial<CardAttributes>,
) => makeTestCard(baseId, id, { attributes })

const dispatchWithEffects = (state: Duel, action: UnknownAction): Duel => {
  const store = makeStore(state)
  store.dispatch(action)
  return store.getState().duel
}

describe('Haunt ability effect', () => {
  test('does not damage cards when opponent plays a character', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': testCard('templeGuard', '1'),
        '2': testCard('haunt', '2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: ['2'],
        }),
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
        h1: testCard('haunt', 'h1', { charges: 0 }),
        z1: testCard('zombie', 'z1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['h1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['z1'],
          discard: [],
        }),
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
        h1: testCard('haunt', 'h1', { charges: 0 }),
        t1: testCard('templeGuard', 't1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['h1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['t1'],
        }),
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
        h1: testCard('haunt', 'h1', { charges: 1 }),
        t1: testCard('templeGuard', 't1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['h1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['t1'],
        }),
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
        h1: testCard('haunt', 'h1', { charges: 0 }),
        t1: testCard('templeGuard', 't1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['h1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['t1'],
        }),
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
  test('leaves state unchanged when attacker is not Burrick', () => {
    const state = makeTestDuel({
      cards: {
        h1: testCard('haunt', 'h1'),
        z1: testCard('zombie', 'z1'),
      },
      players: {
        player1: makeTestPlayer('player1', { board: ['h1'] }),
        player2: makeTestPlayer('player2', { board: ['z1'] }),
      },
    })

    const result = applyCombatReactiveEffects({
      state,
      prevState: state,
      attackerId: 'h1',
      defenderId: 'z1',
    })

    expect(result).toEqual(state)
  })

  test('damages and defeats adjacent cards from the previous board position', () => {
    const state = makeTestDuel({
      cards: {
        b1: testCard('burrick', 'b1', { charges: 1 }),
        left: testCard('zombie', 'left', { life: 1 }),
        target: testCard('templeGuard', 'target'),
        right: testCard('zombie', 'right', { life: 2 }),
      },
      players: {
        player1: makeTestPlayer('player1', { board: ['b1'] }),
        player2: makeTestPlayer('player2', {
          board: ['left', 'target', 'right'],
        }),
      },
    })

    const result = applyCombatReactiveEffects({
      state,
      prevState: state,
      attackerId: 'b1',
      defenderId: 'target',
    })

    expect(result.cards['left']!.attributes.life).toBe(0)
    expect(result.cards['right']!.attributes.life).toBe(1)
    expect(result.cards['b1']!.attributes.charges).toBe(0)
  })

  test('skips splash when defender was not on the previous inactive board', () => {
    const state = makeTestDuel({
      cards: {
        b1: testCard('burrick', 'b1', { charges: 1 }),
        z1: testCard('zombie', 'z1'),
      },
      players: {
        player1: makeTestPlayer('player1', { board: ['b1'] }),
        player2: makeTestPlayer('player2', { board: [] }),
      },
    })

    const result = applyCombatReactiveEffects({
      state,
      prevState: state,
      attackerId: 'b1',
      defenderId: 'z1',
    })

    expect(result).toEqual(state)
  })

  test('damages adjacent cards and loses 1 charge', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        '1': testCard('burrick', '1'),
        '2': testCard('zombie', '2'),
        '3': testCard('templeGuard', '3'),
        '4': testCard('zombie', '4'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['2', '3', '4'],
          discard: [],
        }),
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
        '1': testCard('burrick', '1'),
        '2': testCard('templeGuard', '2'),
        '3': testCard('zombie', '3'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['2', '3'],
          discard: [],
        }),
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
        '1': testCard('burrick', '1'),
        '2': testCard('zombie', '2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['2'],
          discard: [],
        }),
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
        '1': testCard('burrick', '1', { life: 1 }),
        '2': testCard('zombie', '2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['1'],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: ['2'],
          discard: [],
        }),
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
        '1': testCard('haunt', '1'),
        '2': testCard('zombie', '2'),
        '3': testCard('zombie', '3'),
        '4': testCard('zombie', '4'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['2', '3', '4'],
          discard: [],
        }),
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
        '1': testCard('burrick', '1'),
        '2': testCard('zombie', '2'),
        '3': testCard('templeGuard', '3'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['2', '3'],
          discard: [],
        }),
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
        '1': testCard('burrick', '1', { charges: 0 }),
        '2': testCard('zombie', '2'),
        '3': testCard('templeGuard', '3'),
        '4': testCard('zombie', '4'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['2', '3', '4'],
          discard: [],
        }),
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

describe('Burrick with no adjacent cards', () => {
  test('damages only right adjacent card when defender is leftmost', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        '1': testCard('burrick', '1'),
        '2': testCard('zombie', '2'),
        '3': testCard('templeGuard', '3'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['2', '3'],
          discard: [],
        }),
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
        '1': testCard('mysticsSoul', '1'),
        '2': testCard('haunt', '2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: ['2'],
        }),
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
        '1': testCard('burrick', '1', { life: 2, charges: 2 }),
        '2': testCard('zombie', '2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['1'],
        }),
        player2: makeTestPlayer('player2', {
          board: [],
          discard: [],
        }),
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
        '1': testCard('zombie', '1', { life: 2 }),
        '2': testCard('templeGuard', '2', { life: 0 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['2'],
          discard: [],
        }),
      },
    })

    const result = dispatchWithEffects(
      state,
      attackCard({ attackerId: '1', defenderId: '2' }),
    )

    expect(result.cards['1']!.attributes.life).toBe(2)
  })
})

describe('Guardian Statue retaliation effect', () => {
  test('skips retaliation for defenders without retaliation strength', () => {
    const state = makeTestDuel({
      cards: {
        z1: testCard('zombie', 'z1'),
        g1: testCard('guardianStatue', 'g1', { strength: undefined }),
      },
      players: {
        player1: makeTestPlayer('player1', { board: ['z1'] }),
        player2: makeTestPlayer('player2', { board: ['g1'] }),
      },
    })

    const result = applyCombatReactiveEffects({
      state,
      prevState: state,
      attackerId: 'z1',
      defenderId: 'g1',
    })

    expect(result).toEqual(state)
  })

  test('damages attacker when guardian statue is attacked', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        a1: testCard('haunt', 'a1'),
        g1: testCard('guardianStatue', 'g1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['a1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['g1'],
        }),
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
        z1: testCard('zombie', 'z1', { life: 2 }),
        g1: testCard('guardianStatue', 'g1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['z1'],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: ['g1'],
          discard: [],
        }),
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

describe('Mines Guardian final attack effect', () => {
  test('ignores non-Mines Guardian defenders', () => {
    const state = makeTestDuel({
      cards: {
        z1: testCard('zombie', 'z1'),
        t1: testCard('templeGuard', 't1'),
      },
      players: {
        player1: makeTestPlayer('player1', { board: ['z1'] }),
        player2: makeTestPlayer('player2', { board: [] }),
      },
    })
    const prevState = {
      ...state,
      players: {
        ...state.players,
        player2: makeTestPlayer('player2', { board: ['t1'] }),
      },
    }

    const result = applyCombatReactiveEffects({
      state,
      prevState,
      attackerId: 'z1',
      defenderId: 't1',
    })

    expect(result).toEqual(state)
  })

  test('skips final attack when damage cannot be calculated', () => {
    const state = makeTestDuel({
      cards: {
        z1: testCard('zombie', 'z1'),
        m1: testCard('minesGuardian', 'm1', { strength: undefined }),
      },
      players: {
        player1: makeTestPlayer('player1', { board: ['z1'] }),
        player2: makeTestPlayer('player2', { board: [] }),
      },
    })
    const prevState = {
      ...state,
      players: {
        ...state.players,
        player2: makeTestPlayer('player2', { board: ['m1'] }),
      },
    }

    const result = applyCombatReactiveEffects({
      state,
      prevState,
      attackerId: 'z1',
      defenderId: 'm1',
    })

    expect(result).toEqual(state)
  })

  test('defeats attacker when Mines Guardian final attack is lethal', () => {
    const state = makeTestDuel({
      cards: {
        z1: testCard('zombie', 'z1', { life: 1 }),
        m1: testCard('minesGuardian', 'm1', { life: 0 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['z1'],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: [],
          discard: ['m1'],
        }),
      },
    })
    const prevState = {
      ...state,
      players: {
        ...state.players,
        player2: makeTestPlayer('player2', {
          board: ['m1'],
          discard: [],
        }),
      },
    }

    const result = applyCombatReactiveEffects({
      state,
      prevState,
      attackerId: 'z1',
      defenderId: 'm1',
    })

    expect(result.players['player1'].board).toEqual([])
    expect(result.players['player1'].discard).toEqual(['z1'])
    expect(result.cards['z1']!.attributes).toEqual(CARD_BASES['zombie'].attributes)
  })

  test('damages attacker when mines guardian is defeated by normal attack', () => {
    const state = makeTestDuel({
      phase: 'turn-end',
      cards: {
        a1: testCard('haunt', 'a1', { life: 4 }),
        m1: testCard('minesGuardian', 'm1', { life: 1 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['a1'],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: ['m1'],
          discard: [],
        }),
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
        b1: testCard('burrick', 'b1', { life: 3, charges: 1 }),
        m1: testCard('minesGuardian', 'm1', { life: 1 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['b1'],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: ['m1'],
          discard: [],
        }),
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

describe('Defeated character cleanup', () => {
  test('moves defeated board cards to discard with base attributes restored', () => {
    const state = makeTestDuel({
      cards: {
        z1: testCard('zombie', 'z1', { life: 0, hasHaste: true }),
        h1: testCard('haunt', 'h1', { life: 3 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['z1', 'h1'],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
      },
    })

    const result = dispatchWithEffects(state, _cleanupDefeatedCharacters())

    expect(result.players['player1'].board).toEqual(['h1'])
    expect(result.players['player1'].discard).toEqual(['z1'])
    expect(result.cards['z1']!.attributes).toEqual(
      CARD_BASES['zombie'].attributes,
    )
  })
})
