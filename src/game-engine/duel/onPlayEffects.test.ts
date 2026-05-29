import type { UnknownAction } from '@reduxjs/toolkit'

import { applyCardEffects } from 'src/game-engine/duel/effects'
import {
  applyMarkanderReactiveEffect,
  applyOnPlayEffects,
} from 'src/game-engine/duel/effects/onPlayEffects'
import { CARD_BASES } from 'src/game-engine/constants'
import { attackCard, playCard, switchTurn } from 'src/game-engine/duel'
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

describe('Cook effect', () => {
  test('draws a card for the player who played Cook', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': testCard('cook', '1'),
        '2': testCard('zombie', '2'),
        '3': testCard('haunt', '3'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: ['2', '3'],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('cook', '1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
  test('does nothing when no stronger Hammerite is on board', () => {
    const state = makeTestDuel({
      cards: {
        n1: testCard('novice', 'n1'),
        n2: testCard('novice', 'n2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['n1'],
          hand: ['n2'],
        }),
        player2: makeTestPlayer('player2'),
      },
    })

    expect(applyOnPlayEffects(state, 'player1', 'n1')).toEqual(state)
  })

  test('summons copies from hand and deck when stronger Hammerite is on board', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': testCard('novice', '1'),
        '2': testCard('novice', '2'),
        '3': testCard('novice', '3'),
        '4': testCard('templeGuard', '4'),
        '5': testCard('zombie', '5'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1', '2'],
          board: ['4'],
          deck: ['3', '5'],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('novice', '1'),
        '2': testCard('novice', '2'),
        '3': testCard('zombie', '3'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1', '2'],
          board: ['3'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('novice', '1'),
        '2': testCard('novice', '2'),
        '3': testCard('novice', '3'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1', '2'],
          board: ['3'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
  test('skips itself, non-Hammerites, and equal-strength Hammerites', () => {
    const state = makeTestDuel({
      cards: {
        s1: testCard('sachelman', 's1'),
        z1: testCard('zombie', 'z1'),
        t1: testCard('templeGuard', 't1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['s1', 'z1', 't1'],
        }),
        player2: makeTestPlayer('player2'),
      },
    })

    const result = applyOnPlayEffects(state, 'player1', 's1')

    expect(result.cards['s1']!.attributes.life).toBe(
      CARD_BASES['sachelman'].attributes.life,
    )
    expect(result.cards['z1']!.attributes.life).toBe(
      CARD_BASES['zombie'].attributes.life,
    )
    expect(result.cards['t1']!.attributes.life).toBe(
      CARD_BASES['templeGuard'].attributes.life,
    )
  })

  test('gives +1 to weaker Hammerites on board', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': testCard('novice', '1'),
        '2': testCard('templeGuard', '2'),
        '3': testCard('sachelman', '3'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['3'],
          board: ['1', '2'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('zombie', '1'),
        '2': testCard('sachelman', '2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['2'],
          board: ['1'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('templeGuard', '1'),
        '2': testCard('sachelman', '2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['2'],
          board: ['1'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('downwinder', '1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
  test('does nothing when no zombies are in discard', () => {
    const state = makeTestDuel({
      cards: {
        z1: testCard('zombie', 'z1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['z1'],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
      },
    })

    expect(applyOnPlayEffects(state, 'player1', 'z1')).toEqual(state)
  })

  test('summons all zombies from discard to board on play', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': testCard('zombie', '1'),
        '2': testCard('zombie', '2'),
        '3': testCard('zombie', '3'),
        '4': testCard('haunt', '4'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: [],
          discard: ['2', '3', '4'],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('zombie', '1'),
        '2': testCard('zombie', '2'),
        '3': testCard('zombie', '3'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: [],
          discard: ['2', '3'],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('zombie', '1'),
        '2': testCard('haunt', '2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: [],
          discard: ['2'],
        }),
        player2: makeTestPlayer('player2'),
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

describe("Mystic's Soul effect", () => {
  test('skips allied board cards without charges', () => {
    const state = makeTestDuel({
      cards: {
        m1: testCard('mysticsSoul', 'm1'),
        z1: testCard('zombie', 'z1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['m1', 'z1'],
        }),
        player2: makeTestPlayer('player2'),
      },
    })

    const result = applyOnPlayEffects(state, 'player1', 'm1')

    expect(result.cards['z1']!.attributes.charges).toBeUndefined()
  })

  test('adds +1 charges to all allied board cards that have charges', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': testCard('mysticsSoul', '1'),
        '2': testCard('haunt', '2'),
        '3': testCard('burrick', '3'),
        '4': testCard('zombie', '4'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: ['2', '3', '4'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('mysticsSoul', '1'),
        '2': testCard('haunt', '2'),
        '3': testCard('haunt', '3'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: ['2'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: ['3'],
        }),
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
        '1': testCard('mysticsSoul', '1'),
        '2': testCard('zombie', '2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: ['2'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
  test('does nothing when opponent does not have more board cards', () => {
    const state = makeTestDuel({
      cards: {
        t1: testCard('templeGuard', 't1'),
        z1: testCard('zombie', 'z1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['z1', 't1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['z1'],
        }),
      },
    })

    expect(applyOnPlayEffects(state, 'player1', 't1')).toEqual(state)
  })

  test('gets +1 life on play when opponent has more board cards', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': testCard('templeGuard', '1'),
        '2': testCard('zombie', '2'),
        '3': testCard('zombie', '3'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: ['2', '3'],
        }),
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
        '1': testCard('templeGuard', '1'),
        '2': testCard('zombie', '2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: ['2'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: [],
        }),
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
        '1': testCard('zombie', '1', { life: 2 }),
        '2': testCard('templeGuard', '2', { life: 3 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: [],
          board: ['1'],
          deck: [],
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

    expect(result.cards['2']!.attributes.life).toBe(2)
    expect(result.cards['1']!.attributes.life).toBe(2)
    expect(result.players['player1'].board).toContain('1')
    expect(result.players['player2'].board).toContain('2')
  })
})

describe("Yora's Skull effect", () => {
  test('skips allied non-Hammerite board cards', () => {
    const state = makeTestDuel({
      cards: {
        y1: testCard('yoraSkull', 'y1'),
        z1: testCard('zombie', 'z1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['y1', 'z1'],
        }),
        player2: makeTestPlayer('player2'),
      },
    })

    const result = applyOnPlayEffects(state, 'player1', 'y1')

    expect(result.cards['z1']!.attributes.life).toBe(
      CARD_BASES['zombie'].attributes.life,
    )
  })

  test('gives +1 to all allied Hammerites on board', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': testCard('yoraSkull', '1'),
        '2': testCard('templeGuard', '2', { life: 3 }),
        '3': testCard('novice', '3', { life: 1 }),
        '4': testCard('zombie', '4', { life: 2 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: ['2', '3', '4'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('yoraSkull', '1'),
        '2': testCard('templeGuard', '2', { life: 3 }),
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

    expect(result.cards['2']!.attributes.life).toBe(3)
  })

  test('does nothing when no Hammerites on board', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': testCard('yoraSkull', '1'),
        '2': testCard('zombie', '2', { life: 2 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: ['2'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('templeGuard', '1'),
        '2': testCard('markander', '2', { life: 4, charges: 3 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1', '2'],
          board: [],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('novice', '1'),
        '2': testCard('markander', '2', { life: 4, charges: 1 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1', '2'],
          board: [],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('sachelman', '1'),
        '2': testCard('markander', '2', { life: 4, charges: 1 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: ['2'],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('zombie', '1'),
        '2': testCard('markander', '2', { life: 4, charges: 3 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: ['2'],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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
        '1': testCard('templeGuard', '1'),
        '2': testCard('markander', '2', { life: 4, charges: 2 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          hand: ['2'],
        }),
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
        '1': testCard('templeGuard', '1'),
        '2': testCard('markander', '2', { life: 4, charges: 1 }),
        '3': testCard('markander', '3', { life: 4, charges: 1 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1', '2'],
          board: [],
          deck: ['3'],
          discard: [],
        }),
        player2: makeTestPlayer('player2'),
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

describe('Markander reactive effect when no Markander is present', () => {
  test('returns state unchanged when no Markander is in hand or deck', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': testCard('novice', '1'),
        '2': testCard('zombie', '2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: ['2'],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: [],
        }),
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
        '1': testCard('novice', '1'),
        '2': testCard('markander', '2', { charges: 3 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1', '2'],
          board: [],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: [],
        }),
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
        '1': testCard('zombie', '1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['1'],
          board: [],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: [],
        }),
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

describe('Elevated Acolyte on-play solo bonus', () => {
  test('does nothing when it is not the only allied living character', () => {
    const state = makeTestDuel({
      cards: {
        e1: testCard('elevatedAcolyte', 'e1'),
        z1: testCard('zombie', 'z1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['z1', 'e1'],
        }),
        player2: makeTestPlayer('player2'),
      },
    })

    expect(applyOnPlayEffects(state, 'player1', 'e1')).toEqual(state)
  })

  test('gains haste when played alone', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        e1: testCard('elevatedAcolyte', 'e1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['e1'],
          board: [],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: [],
        }),
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
        e1: testCard('elevatedAcolyte', 'e1'),
        z1: testCard('zombie', 'z1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['e1'],
          board: [],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: ['z1'],
        }),
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
        e1: testCard('elevatedAcolyte', 'e1'),
        z1: testCard('zombie', 'z1', { life: 2 }),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['e1'],
          board: ['z1'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: [],
        }),
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
        e1: testCard('elevatedAcolyte', 'e1', {
          hasHaste: true,
          isStunned: false,
          strength: 2,
        }),
        z1: testCard('zombie', 'z1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          hand: ['z1'],
          board: ['e1'],
          deck: [],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: [],
        }),
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
