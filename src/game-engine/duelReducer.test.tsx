import {
  CARD_BASES,
  INITIAL_CARDS_TO_DRAW,
  INITIAL_DUEL_STATE,
  PLACEHOLDER_PLAYER,
} from 'src/game-engine/constants'
import {
  PLAYER_1_DECK,
  PLAYER_2_DECK,
} from 'src/game-engine/constants/testDecks'
import { duelReducer } from 'src/game-engine/duelReducer'
import { createCardInstance } from 'src/game-engine/helpers'
import { makeTestDuel } from 'src/game-engine/mocks'

test('initial state has intro phase', () => {
  expect(INITIAL_DUEL_STATE.phase).toBe('intro')
})

test('START_DUEL creates new duel with player names and decks', () => {
  const result = duelReducer(INITIAL_DUEL_STATE, {
    type: 'START_DUEL',
    payload: {
      players: [
        { id: 'player1', name: 'Alice', deck: PLAYER_1_DECK },
        { id: 'player2', name: 'Bob', deck: PLAYER_2_DECK },
      ],
    },
  })

  expect(result.players['player1'].name).toBe('Alice')
  expect(result.players['player2'].name).toBe('Bob')
  expect(result.players['player1'].deck).toHaveLength(PLAYER_1_DECK.length)
  expect(result.players['player2'].deck).toHaveLength(PLAYER_2_DECK.length)
  expect(result.players['player1'].hand).toEqual([])
  expect(result.players['player2'].hand).toEqual([])
  expect(result.playerOrder[0]).not.toBe(result.playerOrder[1])

  Object.values(result.cards).forEach((card) => {
    expect([...PLAYER_1_DECK, ...PLAYER_2_DECK]).toContain(card.base.id)
  })

  const player1EliteCount = PLAYER_1_DECK.filter(
    (baseId) => CARD_BASES[baseId].rank === 'elite',
  ).length
  const player1TotalCost = PLAYER_1_DECK.reduce(
    (sum, baseId) => sum + CARD_BASES[baseId].attributes.cost,
    0,
  )
  const player2EliteCount = PLAYER_2_DECK.filter(
    (baseId) => CARD_BASES[baseId].rank === 'elite',
  ).length
  const player2TotalCost = PLAYER_2_DECK.reduce(
    (sum, baseId) => sum + CARD_BASES[baseId].attributes.cost,
    0,
  )

  expect(result.logs).toEqual([
    `Alice's deck: ${PLAYER_1_DECK.length} cards / ${player1EliteCount} elites / ${player1TotalCost} total cost.`,
    `Bob's deck: ${PLAYER_2_DECK.length} cards / ${player2EliteCount} elites / ${player2TotalCost} total cost.`,
  ])
})

describe('START_INITIAL_DRAW', () => {
  test('draws starting hands for both players', () => {
    const duel = duelReducer(INITIAL_DUEL_STATE, {
      type: 'START_DUEL',
      payload: {
        players: [
          { id: 'player1', name: 'Alice', deck: PLAYER_1_DECK },
          { id: 'player2', name: 'Bob', deck: PLAYER_2_DECK },
        ],
      },
    })

    const result = duelReducer(duel, { type: 'START_INITIAL_DRAW' })

    expect(result.players[result.playerOrder[0]].hand).toHaveLength(
      INITIAL_CARDS_TO_DRAW,
    )
    expect(result.players[result.playerOrder[1]].hand).toHaveLength(
      INITIAL_CARDS_TO_DRAW,
    )
    expect(result.phase).toBe('initial-draw')
  })
})

describe('GO_TO_REDRAW', () => {
  test('transitions from initial-draw to redraw phase', () => {
    const state = makeTestDuel({ phase: 'initial-draw' })
    const result = duelReducer(state, { type: 'GO_TO_REDRAW' })

    expect(result.phase).toBe('redraw')
  })
})

describe('START_FIRST_PLAYER_TURN', () => {
  test('sets phase to player-turn and resets playerReady', () => {
    const state = makeTestDuel({
      phase: 'redraw',
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          playerReady: true,
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          playerReady: true,
        },
      },
    })

    const result = duelReducer(state, { type: 'START_FIRST_PLAYER_TURN' })

    expect(result.phase).toBe('player-turn')
    expect(result.players['player1'].playerReady).toBe(false)
    expect(result.players['player2'].playerReady).toBe(false)
  })

  test('logs which player goes first', () => {
    const state = makeTestDuel()

    const result = duelReducer(state, { type: 'START_FIRST_PLAYER_TURN' })

    expect(result.logs).toContain('Alice goes first.')
  })

  test('draws one card for the first player when first turn starts', () => {
    const state = makeTestDuel({
      phase: 'redraw',
      cards: {
        c1: createCardInstance('zombie', 'c1'),
        c2: createCardInstance('haunt', 'c2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          playerReady: true,
          hand: ['c1'],
          deck: ['c2'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          playerReady: true,
        },
      },
    })

    const result = duelReducer(state, { type: 'START_FIRST_PLAYER_TURN' })

    expect(result.players['player1'].hand).toEqual(['c1', 'c2'])
    expect(result.players['player1'].deck).toEqual([])
  })
})

describe('SWITCH_TURN', () => {
  test('switches active and inactive players', () => {
    const state = makeTestDuel()

    const { playerOrder } = duelReducer(state, { type: 'SWITCH_TURN' })

    expect(playerOrder[0]).toBe('player2')
    expect(playerOrder[1]).toBe('player1')
  })

  test('switches back when called twice', () => {
    const state = makeTestDuel()

    const result1 = duelReducer(state, { type: 'SWITCH_TURN' })
    const { playerOrder } = duelReducer(result1, { type: 'SWITCH_TURN' })

    expect(playerOrder[0]).toBe('player1')
    expect(playerOrder[1]).toBe('player2')
  })

  test('draws one card for the new active player', () => {
    const state = makeTestDuel({
      cards: {
        c1: createCardInstance('cook', 'c1'),
        c2: createCardInstance('haunt', 'c2'),
        c3: createCardInstance('zombie', 'c3'),
      },
      players: {
        player1: { ...PLACEHOLDER_PLAYER, id: 'player1', name: 'Alice' },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          hand: ['c1'],
          deck: ['c2', 'c3'],
        },
      },
    })

    const result = duelReducer(state, { type: 'SWITCH_TURN' })

    expect(result.players['player2'].hand).toHaveLength(2)
    expect(result.players['player2'].deck).toHaveLength(1)
  })

  test('resets didAct flags on all cards', () => {
    const state = makeTestDuel({
      cards: {
        c1: { ...createCardInstance('zombie', 'c1'), didAct: true },
        c2: { ...createCardInstance('haunt', 'c2'), didAct: true },
      },
    })

    const result = duelReducer(state, { type: 'SWITCH_TURN' })

    expect(result.cards['c1']!.didAct).toBe(false)
    expect(result.cards['c2']!.didAct).toBe(false)
  })

  test('does not remove haste from cards', () => {
    const state = makeTestDuel({
      cards: {
        c1: createCardInstance('zombie', 'c1', { haste: true }),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['c1'],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = duelReducer(state, { type: 'SWITCH_TURN' })

    expect(result.cards['c1']!.attributes.haste).toBe(true)
  })

  test('resets playerReady for all players', () => {
    const state = makeTestDuel({
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          playerReady: true,
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          playerReady: true,
        },
      },
    })

    const result = duelReducer(state, { type: 'SWITCH_TURN' })

    expect(result.players['player1'].playerReady).toBe(false)
    expect(result.players['player2'].playerReady).toBe(false)
  })
})

describe('PLAY_CARD', () => {
  const zombie = createCardInstance('zombie', 'z1')
  const bookOfAsh = createCardInstance('bookOfAsh', 'b1')

  const state = makeTestDuel({
    phase: 'player-turn',
    cards: { z1: zombie, b1: bookOfAsh },
    players: {
      player1: {
        ...PLACEHOLDER_PLAYER,
        id: 'player1',
        name: 'Alice',
        hand: ['z1', 'b1'],
      },
      player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
    },
  })

  test('moves character card from hand to board', () => {
    const result = duelReducer(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 'z1' },
    })

    expect(result.players['player1'].hand).toEqual(['b1'])
    expect(result.players['player1'].board).toEqual(['z1'])
    expect(result.players['player1'].discard).toEqual([])
    expect(result.players['player1'].coins).toBe(
      state.players['player1'].coins - zombie.attributes.cost,
    )
  })

  test('transitions to turn-end when playing a character card', () => {
    const result = duelReducer(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 'z1' },
    })

    expect(result.phase).toBe('turn-end')
  })

  test('moves instant card from hand to discard', () => {
    const result = duelReducer(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 'b1' },
    })

    expect(result.players['player1'].hand).toEqual(['z1'])
    expect(result.players['player1'].board).toEqual([])
    expect(result.players['player1'].discard).toEqual(['b1'])
    expect(result.players['player1'].coins).toBe(
      state.players['player1'].coins - bookOfAsh.attributes.cost,
    )
    expect(result.phase).toBe('turn-end')
  })

  test('does not modify other player', () => {
    const result = duelReducer(state, {
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: 'z1' },
    })

    expect(result.players['player2']).toEqual(state.players['player2'])
  })
})

describe('REDRAW_CARD', () => {
  const state = makeTestDuel({
    cards: {
      c1: createCardInstance('zombie', 'c1'),
      c2: createCardInstance('haunt', 'c2'),
      c3: createCardInstance('cook', 'c3'),
    },
    players: {
      player1: {
        ...PLACEHOLDER_PLAYER,
        id: 'player1',
        name: 'Alice',
        hand: ['c1', 'c2'],
        deck: ['c3'],
      },
      player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
    },
  })

  test('puts card at bottom of deck and draws from top', () => {
    const result = duelReducer(state, {
      type: 'REDRAW_CARD',
      payload: { playerId: 'player1', cardInstanceId: 'c1' },
    })

    expect(result.players['player1'].hand).toEqual(['c2', 'c3'])
    expect(result.players['player1'].deck).toEqual(['c1'])
    expect(result.players['player1'].playerReady).toBe(true)
  })

  test('handles redraw when deck is empty after adding card', () => {
    const emptyDeckState = makeTestDuel({
      cards: { c1: createCardInstance('zombie', 'c1') },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          hand: ['c1'],
          deck: [],
        },
        player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' },
      },
    })

    const result = duelReducer(emptyDeckState, {
      type: 'REDRAW_CARD',
      payload: { playerId: 'player1', cardInstanceId: 'c1' },
    })

    expect(result.players['player1'].hand).toEqual(['c1'])
    expect(result.players['player1'].deck).toEqual([])
    expect(result.players['player1'].playerReady).toBe(true)
  })

  test('handles multiple redraws sequentially', () => {
    const result1 = duelReducer(state, {
      type: 'REDRAW_CARD',
      payload: { playerId: 'player1', cardInstanceId: 'c1' },
    })
    const result2 = duelReducer(result1, {
      type: 'REDRAW_CARD',
      payload: { playerId: 'player1', cardInstanceId: 'c2' },
    })

    expect(result2.players['player1'].hand).toEqual(['c3', 'c1'])
    expect(result2.players['player1'].deck).toEqual(['c2'])
  })

  test('does not modify other player', () => {
    const result = duelReducer(state, {
      type: 'REDRAW_CARD',
      payload: { playerId: 'player1', cardInstanceId: 'c1' },
    })

    expect(result.players['player2']).toEqual(state.players['player2'])
  })
})

describe('SKIP_REDRAW', () => {
  test('sets playerReady to true and appends a log', () => {
    const state = makeTestDuel({ phase: 'redraw' })

    const result = duelReducer(state, {
      type: 'SKIP_REDRAW',
      payload: { playerId: 'player1' },
    })

    expect(result.players['player1'].playerReady).toBe(true)
    expect(result.logs).toContain('Alice skips redraw.')
  })

  test('does not duplicate logs when already ready', () => {
    const state = makeTestDuel({ phase: 'redraw' })

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
    const state = makeTestDuel({
      cards: {
        z1: createCardInstance('zombie', 'z1'),
        h1: createCardInstance('haunt', 'h1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['z1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['h1'],
        },
      },
    })

    const result = duelReducer(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 'z1', defenderId: 'h1' },
    })

    expect(result.cards['z1']!.didAct).toBe(true)
    expect(result.cards['h1']!.attributes.life).toBe(2)
  })

  test('destroys defender when damage exceeds life', () => {
    const state = makeTestDuel({
      cards: {
        z1: createCardInstance('zombie', 'z1'),
        z2: createCardInstance('zombie', 'z2'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['z1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['z2'],
        },
      },
    })

    const result = duelReducer(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 'z1', defenderId: 'z2' },
    })

    expect(result.players['player2'].board).not.toContain('z2')
    expect(result.players['player2'].discard).toContain('z2')
  })

  test('attacker does not take retaliation damage', () => {
    const state = makeTestDuel({
      cards: {
        z1: createCardInstance('zombie', 'z1'),
        h1: createCardInstance('haunt', 'h1'),
      },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['z1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          board: ['h1'],
        },
      },
    })

    const result = duelReducer(state, {
      type: 'ATTACK_CARD',
      payload: { attackerId: 'z1', defenderId: 'h1' },
    })

    expect(result.players['player1'].board).toContain('z1')
    expect(result.players['player1'].discard).not.toContain('z1')
  })
})

describe('ATTACK_PLAYER', () => {
  test('reduces inactive player coins and marks attacker as acted', () => {
    const state = makeTestDuel({
      cards: { z1: createCardInstance('zombie', 'z1') },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['z1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          coins: 5,
        },
      },
    })

    const result = duelReducer(state, {
      type: 'ATTACK_PLAYER',
      payload: { attackerId: 'z1' },
    })

    expect(result.cards['z1']!.didAct).toBe(true)
    expect(result.players['player2'].coins).toBe(4)
  })

  test('does not reduce coins below zero', () => {
    const state = makeTestDuel({
      cards: { z1: createCardInstance('zombie', 'z1') },
      players: {
        player1: {
          ...PLACEHOLDER_PLAYER,
          id: 'player1',
          name: 'Alice',
          board: ['z1'],
        },
        player2: {
          ...PLACEHOLDER_PLAYER,
          id: 'player2',
          name: 'Bob',
          coins: 0,
        },
      },
    })

    const result = duelReducer(state, {
      type: 'ATTACK_PLAYER',
      payload: { attackerId: 'z1' },
    })

    expect(result.players['player2'].coins).toBe(0)
  })
})

describe('unknown action', () => {
  test('returns unchanged state', () => {
    const state = makeTestDuel()
    const result = duelReducer(state, { type: 'UNKNOWN' } as any)

    expect(result).toEqual(state)
  })
})
