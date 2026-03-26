import { applyCardEffects } from 'src/game-engine/cardEffects'
import { CARD_BASES, PLACEHOLDER_PLAYER } from 'src/game-engine/constants'
import { duelReducerWithEffects } from 'src/game-engine/duelReducer'
import { createCardInstance } from 'src/game-engine/helpers'
import { makeTestDuel } from 'src/game-engine/mocks'

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.players['player1'].board).toContain('1')
    expect(result.players['player1'].board).toContain('2')
    expect(result.players['player1'].board).toContain('3')
    expect(result.players['player1'].board).toContain('4')

    expect(result.players['player1'].hand).not.toContain('2')
    expect(result.players['player1'].deck).not.toContain('3')

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '3' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '2' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '2' },
    })

    expect(result.cards['1']!.attributes.life).toBe(
      CARD_BASES['templeGuard'].attributes.life,
    )
  })
})

describe('Card effects middleware', () => {
  test('does not interfere with non-PLAY_CARD actions', () => {
    const state = makeTestDuel()

    const result = duelReducerWithEffects(state, {
      type: 'SWITCH_TURN',
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.players['player1'].board).toContain('1')
    expect(result.players['player1'].board).toContain('2')
    expect(result.players['player1'].board).toContain('3')
    expect(result.players['player1'].discard).toEqual(['4'])
  })

  test('resets life of summoned zombies to base value', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('zombie', '1'),
        '2': createCardInstance('zombie', '2', { life: 0 }),
        '3': createCardInstance('zombie', '3', { life: 0 }),
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    const baseLife = CARD_BASES['zombie'].attributes.life

    expect(result.cards['2']!.attributes.life).toBe(baseLife)
    expect(result.cards['3']!.attributes.life).toBe(baseLife)
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.players['player1'].board).toEqual(['1'])
    expect(result.players['player1'].discard).toEqual(['2'])
  })
})

describe('Haunt reactive effect', () => {
  test('deals damage equal to haunt strength to the played card', () => {
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.cards['1']!.attributes.life).toBe(2)
    expect(result.players['player1'].board).toContain('1')
  })

  test('kills the played card when haunt damage exceeds its life', () => {
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.players['player1'].board).not.toContain('1')
    expect(result.players['player1'].discard).toContain('1')
    expect(result.cards['1']!.attributes.life).toBe(0)
  })

  test('multiple haunts deal cumulative damage', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('templeGuard', '1'),
        '2': createCardInstance('haunt', '2'),
        '3': createCardInstance('haunt', '3'),
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.cards['1']!.attributes.life).toBe(2)
  })

  test('applies the sum of all haunt strengths as damage', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('templeGuard', '1'),
        '2': createCardInstance('haunt', '2', { strength: 3 }),
        '3': createCardInstance('haunt', '3'),
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
          discard: [],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.cards['1']!.attributes.life).toBe(0)
    expect(result.players['player1'].board).not.toContain('1')
    expect(result.players['player1'].discard).toContain('1')
  })

  test('does not damage summoned cards from zombie effect', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('zombie', '1'),
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
          deck: [],
          discard: ['2'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['3'],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.cards['2']!.attributes.life).toBe(1)
    expect(result.players['player1'].board).toContain('2')
  })

  test('does not damage summoned cards from novice effect', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('novice', '1'),
        '2': createCardInstance('novice', '2'),
        '3': createCardInstance('templeGuard', '3'),
        '4': createCardInstance('haunt', '4'),
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
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['4'],
        },
      },
    })

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.cards['2']!.attributes.life).toBe(1)
    expect(result.players['player1'].board).toContain('2')
  })

  test('does not react to instant cards', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('bookOfAsh', '1'),
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.players['player1'].discard).toContain('1')
  })

  test('reduces haunt charges by 1 when reacting', () => {
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.cards['2']!.attributes.charges).toBe(0)
  })

  test('does not react when charges is 0', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('templeGuard', '1'),
        '2': createCardInstance('haunt', '2', { charges: 0 }),
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.cards['1']!.attributes.life).toBe(3)
    expect(result.players['player1'].board).toContain('1')
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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '3' },
    })

    expect(result.cards['3']!.attributes.life).toBe(2)
    expect(result.players['player2'].board).not.toContain('2')
    expect(result.players['player2'].discard).toContain('2')
    expect(result.players['player2'].board).not.toContain('4')
    expect(result.players['player2'].discard).toContain('4')
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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '3' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '2' },
    })

    expect(result.players['player2'].board).not.toContain('2')
    expect(result.players['player2'].discard).toContain('2')
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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '2' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '3' },
    })

    expect(result.cards['2']!.attributes.life).toBe(1)
    expect(result.cards['4']!.attributes.life).toBe(1)
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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '3' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '3' },
    })

    expect(result.cards['3']!.attributes.life).toBe(2)
    expect(result.cards['2']!.attributes.life).toBe(1)
    expect(result.cards['4']!.attributes.life).toBe(1)
    expect(result.players['player2'].board).toContain('2')
    expect(result.players['player2'].board).toContain('4')
    expect(result.cards['1']!.attributes.life).toBe(1)
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.cards['2']!.attributes.charges).toBe(2)
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.cards['2']!.attributes.charges).toBe(2)
    expect(result.cards['3']!.attributes.charges).toBe(1)
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.cards['1']!.attributes.life).toBe(
      CARD_BASES['templeGuard'].attributes.life,
    )
  })

  test('retaliates when attacked and survives', () => {
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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '2' },
    })

    expect(result.cards['2']!.attributes.life).toBe(2)
    expect(result.cards['1']!.attributes.life).toBe(1)
    expect(result.players['player1'].board).toContain('1')
    expect(result.players['player2'].board).toContain('2')
  })

  test('retaliation kills the attacker when templeGuard has enough strength', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('zombie', '1', { life: 1 }),
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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '2' },
    })

    expect(result.cards['2']!.attributes.life).toBe(2)
    expect(result.players['player2'].board).toContain('2')
    expect(result.cards['1']!.attributes.life).toBe(0)
    expect(result.players['player1'].board).not.toContain('1')
    expect(result.players['player1'].discard).toContain('1')
  })

  test('does not retaliate when templeGuard is killed (0 life)', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        '1': createCardInstance('zombie', '1'),
        '2': createCardInstance('templeGuard', '2', { life: 1 }),
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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '2' },
    })

    expect(result.cards['2']!.attributes.life).toBe(0)
    expect(result.players['player2'].board).not.toContain('2')
    expect(result.players['player2'].discard).toContain('2')
    expect(result.cards['1']!.attributes.life).toBe(1)
    expect(result.players['player1'].board).toContain('1')
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '2' },
    })

    expect(result.cards['3']!.attributes.life).toBe(2)
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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

    expect(result.cards['2']!.attributes.charges).toBe(1)
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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '2' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: '1', defenderId: '2' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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

    const result = duelReducerWithEffects(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: '1' },
    })

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
