import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  CARD_BASES,
  INITIAL_CARDS_TO_DRAW,
  INITIAL_DUEL_STATE,
  INITIAL_PLAYER_COINS,
  PLAYER_2_INITIAL_HAND,
  SECOND_PLAYER_COIN_BONUS,
} from 'src/game-engine/constants'
import {
  applyBookOfAsh,
  applyFlashBomb,
  applySpeedPotion,
  attackCard,
  attackPlayer,
  duelReducer,
  goToRedraw,
  playCard,
  redrawCard,
  setPendingCharacterAbility,
  setPendingInstant,
  skipRedraw,
  startDuel,
  startFirstPlayerTurn,
  startInitialDraw,
  switchTurn,
} from 'src/game-engine/duel'
import {
  makeTestCard,
  makeTestCards,
  makeTestDuelState,
  PLAYER_1_TEST_DECK,
  PLAYER_2_TEST_DECK,
} from 'src/game-engine/testing'
import type { CardAttributes, CardBaseId } from 'src/game-engine/types'
import { formatString, messages } from 'src/i18n'

const card = (
  baseId: CardBaseId,
  id: string,
  attributes?: Partial<CardAttributes>,
) => makeTestCard(baseId, id, { attributes })

const actedCard = (
  baseId: CardBaseId,
  id: string,
  attributes?: Partial<CardAttributes>,
) => makeTestCard(baseId, id, { attributes, didAct: true })

afterEach(() => {
  vi.restoreAllMocks()
})

test('initial state has intro phase', () => {
  expect(INITIAL_DUEL_STATE.phase).toBe('intro')
})

describe('duel setup and phases', () => {
  test('START_DUEL creates players, decks, starting coins, and setup logs', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1)

    const result = duelReducer(
      INITIAL_DUEL_STATE,
      startDuel({
        players: [
          { id: 'player1', name: 'Alice', deck: PLAYER_1_TEST_DECK },
          { id: 'player2', name: 'Bob', deck: PLAYER_2_TEST_DECK },
        ],
      }),
    )

    expect(result.playerOrder).toEqual(['player1', 'player2'])
    expect(result.players['player1']).toEqual(
      expect.objectContaining({
        name: 'Alice',
        coins: INITIAL_PLAYER_COINS,
        hand: [],
      }),
    )
    expect(result.players['player2']).toEqual(
      expect.objectContaining({
        name: 'Bob',
        coins: INITIAL_PLAYER_COINS + SECOND_PLAYER_COIN_BONUS,
        hand: [],
      }),
    )
    expect(result.players['player1'].deck).toHaveLength(
      PLAYER_1_TEST_DECK.length,
    )
    expect(result.players['player2'].deck).toHaveLength(
      PLAYER_2_TEST_DECK.length,
    )
    expect(
      Object.values(result.cards).map((createdCard) => createdCard.base.id),
    ).toEqual(
      expect.arrayContaining([...PLAYER_1_TEST_DECK, ...PLAYER_2_TEST_DECK]),
    )
    expect(result.logs).toHaveLength(2)
  })

  test('START_INITIAL_DRAW draws asymmetric starting hands', () => {
    const state = makeTestDuelState({
      cards: makeTestCards(
        ...Array.from({ length: 10 }, (_, index) =>
          card('zombie', `p1-${index}`),
        ),
        ...Array.from({ length: 10 }, (_, index) =>
          card('haunt', `p2-${index}`),
        ),
      ),
      player1: {
        deck: Array.from({ length: 10 }, (_, index) => `p1-${index}`),
      },
      player2: {
        deck: Array.from({ length: 10 }, (_, index) => `p2-${index}`),
      },
    })

    const result = duelReducer(state, startInitialDraw())

    expect(result.phase).toBe('initial-draw')
    expect(result.players['player1'].hand).toHaveLength(INITIAL_CARDS_TO_DRAW)
    expect(result.players['player2'].hand).toHaveLength(PLAYER_2_INITIAL_HAND)
  })

  test('GO_TO_REDRAW enters redraw and clears pending character ability', () => {
    const state = makeTestDuelState({
      phase: 'initial-draw',
      pendingCharacterAbility: {
        sourceCardInstanceId: 'b1',
        sourceCardBaseId: 'burrick',
      },
    })

    const result = duelReducer(state, goToRedraw())

    expect(result.phase).toBe('redraw')
    expect(result.pendingCharacterAbility).toBeNull()
  })

  test('START_FIRST_PLAYER_TURN resets ready flags, draws, and logs starter', () => {
    const state = makeTestDuelState({
      phase: 'redraw',
      cards: [card('zombie', 'z1'), card('haunt', 'h1')],
      player1: { playerReady: true, hand: ['z1'], deck: ['h1'] },
      player2: { playerReady: true },
    })

    const result = duelReducer(state, startFirstPlayerTurn())

    expect(result.phase).toBe('player-turn')
    expect(result.players['player1'].playerReady).toBe(false)
    expect(result.players['player2'].playerReady).toBe(false)
    expect(result.players['player1'].hand).toEqual(['z1', 'h1'])
    expect(result.logs).toContain(
      formatString(messages.reducer.goesFirst, { playerName: 'Alice' }),
    )
  })
})

describe('turn switching', () => {
  test('switches active player and resets acted/ready/pending state', () => {
    const state = makeTestDuelState({
      phase: 'turn-end',
      cards: [
        actedCard('zombie', 'z1'),
        actedCard('haunt', 'h1'),
        card('cook', 'c1'),
      ],
      player1: { playerReady: true, board: ['z1'] },
      player2: {
        playerReady: true,
        hand: ['h1'],
        deck: ['c1'],
        discard: ['spent'],
      },
      pendingCharacterAbility: {
        sourceCardInstanceId: 'z1',
        sourceCardBaseId: 'zombie',
      },
    })

    const result = duelReducer(state, switchTurn())

    expect(result.playerOrder).toEqual(['player2', 'player1'])
    expect(result.phase).toBe('player-turn')
    expect(result.cards['z1'].didAct).toBe(false)
    expect(result.cards['h1'].didAct).toBe(false)
    expect(result.players['player1'].playerReady).toBe(false)
    expect(result.players['player2'].playerReady).toBe(false)
    expect(result.pendingCharacterAbility).toBeNull()
  })

  test('skips draw on second player first turn', () => {
    const state = makeTestDuelState({
      cards: [card('cook', 'c1'), card('haunt', 'c2')],
      player2: { hand: ['c1'], deck: ['c2'] },
    })

    const result = duelReducer(state, switchTurn())

    expect(result.players['player2'].hand).toEqual(['c1'])
    expect(result.players['player2'].deck).toEqual(['c2'])
  })

  test("keeps stunned cards stunned until their owner's next turn", () => {
    const state = makeTestDuelState({
      cards: [
        card('zombie', 'z1', { isStunned: true }),
        card('haunt', 'h1', { isStunned: true }),
      ],
      player1: { board: ['z1'] },
      player2: { board: ['h1'] },
    })

    const afterFirstSwitch = duelReducer(state, switchTurn())
    const afterSecondSwitch = duelReducer(afterFirstSwitch, switchTurn())

    expect(afterFirstSwitch.cards['z1'].attributes.isStunned).toBe(true)
    expect(afterFirstSwitch.cards['h1'].attributes.isStunned).toBe(false)
    expect(afterSecondSwitch.cards['z1'].attributes.isStunned).toBe(false)
  })

  test('flash bomb stun skips the target full next turn', () => {
    const state = makeTestDuelState({
      pendingInstant: 'FLASH_BOMB',
      cards: [card('zombie', 'attacker'), card('templeGuard', 'target')],
      player1: { board: ['attacker'] },
      player2: { board: ['target'] },
    })

    const afterFlashBomb = duelReducer(
      state,
      applyFlashBomb({ targetCardInstanceId: 'target' }),
    )
    const onTargetTurn = duelReducer(afterFlashBomb, switchTurn())
    const attackWhileStunned = duelReducer(
      onTargetTurn,
      attackCard({ attackerId: 'target', defenderId: 'attacker' }),
    )
    const nextTargetTurn = duelReducer(
      duelReducer(onTargetTurn, switchTurn()),
      switchTurn(),
    )

    expect(onTargetTurn.cards['target'].attributes).toEqual(
      expect.objectContaining({ isStunned: true, stunnedTurnsRemaining: 0 }),
    )
    expect(attackWhileStunned.cards['attacker'].attributes.life).toBe(2)
    expect(nextTargetTurn.cards['target'].attributes.isStunned).toBe(false)
  })
})

describe('cards and redraw', () => {
  test('PLAY_CARD moves characters to board, spends coins, stuns them, and ends turn', () => {
    const state = makeTestDuelState({
      phase: 'player-turn',
      cards: [card('zombie', 'z1'), card('bookOfAsh', 'b1')],
      player1: { hand: ['z1', 'b1'] },
    })

    const result = duelReducer(
      state,
      playCard({ playerId: 'player1', cardInstanceId: 'z1' }),
    )

    expect(result.phase).toBe('turn-end')
    expect(result.players['player1'].hand).toEqual(['b1'])
    expect(result.players['player1'].board).toEqual(['z1'])
    expect(result.players['player1'].coins).toBe(
      state.players['player1'].coins - CARD_BASES['zombie'].attributes.cost,
    )
    expect(result.cards['z1'].attributes.isStunned).toBe(true)
  })

  test('PLAY_CARD moves instants to discard and records pending target mode', () => {
    const state = makeTestDuelState({
      phase: 'player-turn',
      cards: [card('zombie', 'z1'), card('bookOfAsh', 'b1')],
      player1: { hand: ['z1', 'b1'] },
    })

    const result = duelReducer(
      state,
      playCard({ playerId: 'player1', cardInstanceId: 'b1' }),
    )

    expect(result.phase).toBe('turn-end')
    expect(result.players['player1'].hand).toEqual(['z1'])
    expect(result.players['player1'].discard).toEqual(['b1'])
    expect(result.pendingInstant).toBe('BOOK_OF_ASH')
  })

  test('REDRAW_CARD bottoms selected card, draws a replacement, and marks ready', () => {
    const state = makeTestDuelState({
      cards: [card('zombie', 'z1'), card('haunt', 'h1'), card('cook', 'c1')],
      player1: { hand: ['z1', 'h1'], deck: ['c1'] },
    })

    const result = duelReducer(
      state,
      redrawCard({ playerId: 'player1', cardInstanceId: 'z1' }),
    )

    expect(result.players['player1']).toEqual(
      expect.objectContaining({
        hand: ['h1', 'c1'],
        deck: ['z1'],
        playerReady: true,
      }),
    )
    expect(result.players['player2']).toEqual(state.players['player2'])
  })

  test('REDRAW_CARD returns the same card when no replacement exists', () => {
    const state = makeTestDuelState({
      cards: [card('zombie', 'z1')],
      player1: { hand: ['z1'], deck: [] },
    })

    const result = duelReducer(
      state,
      redrawCard({ playerId: 'player1', cardInstanceId: 'z1' }),
    )

    expect(result.players['player1'].hand).toEqual(['z1'])
    expect(result.players['player1'].deck).toEqual([])
  })

  test('SKIP_REDRAW marks ready once and clears pending character ability', () => {
    const state = makeTestDuelState({
      phase: 'redraw',
      pendingCharacterAbility: {
        sourceCardInstanceId: 'b1',
        sourceCardBaseId: 'burrick',
      },
    })

    const result1 = duelReducer(state, skipRedraw({ playerId: 'player1' }))
    const result2 = duelReducer(result1, skipRedraw({ playerId: 'player1' }))

    expect(result2.players['player1'].playerReady).toBe(true)
    expect(result2.pendingCharacterAbility).toBeNull()
    expect(result2.logs).toEqual([
      formatString(messages.reducer.skipRedraw, { playerName: 'Alice' }),
    ])
  })
})

describe('instant reducers', () => {
  test('pending instant and character ability setters store selected mode', () => {
    const withInstant = duelReducer(
      makeTestDuelState(),
      setPendingInstant({ pendingInstant: 'FLASH_BOMB' }),
    )
    const withAbility = duelReducer(
      withInstant,
      setPendingCharacterAbility({
        pendingCharacterAbility: {
          sourceCardInstanceId: 'b1',
          sourceCardBaseId: 'burrick',
        },
      }),
    )

    expect(withAbility.pendingInstant).toBe('FLASH_BOMB')
    expect(withAbility.pendingCharacterAbility).toEqual({
      sourceCardInstanceId: 'b1',
      sourceCardBaseId: 'burrick',
    })
  })

  test('APPLY_SPEED_POTION grants haste, clears pending state, and ignores missing targets', () => {
    const state = makeTestDuelState({
      pendingInstant: 'SPEED_POTION',
      pendingCharacterAbility: {
        sourceCardInstanceId: 'b1',
        sourceCardBaseId: 'burrick',
      },
      cards: [card('zombie', 'z1')],
    })

    const missingTarget = duelReducer(
      state,
      applySpeedPotion({ targetCardInstanceId: 'missing' }),
    )
    const result = duelReducer(
      state,
      applySpeedPotion({ targetCardInstanceId: 'z1' }),
    )

    expect(missingTarget.pendingInstant).toBe('SPEED_POTION')
    expect(result.pendingInstant).toBeNull()
    expect(result.pendingCharacterAbility).toBeNull()
    expect(result.cards['z1'].attributes.hasHaste).toBe(true)
  })

  test('APPLY_FLASH_BOMB stuns targets for a full turn and ignores missing targets', () => {
    const state = makeTestDuelState({
      pendingInstant: 'FLASH_BOMB',
      cards: [card('zombie', 'z1', { stunnedTurnsRemaining: 2 })],
    })

    const missingTarget = duelReducer(
      state,
      applyFlashBomb({ targetCardInstanceId: 'missing' }),
    )
    const result = duelReducer(
      state,
      applyFlashBomb({ targetCardInstanceId: 'z1' }),
    )

    expect(missingTarget.pendingInstant).toBe('FLASH_BOMB')
    expect(result.pendingInstant).toBeNull()
    expect(result.cards['z1']).toEqual(
      expect.objectContaining({
        didAct: true,
        attributes: expect.objectContaining({
          isStunned: true,
          stunnedTurnsRemaining: 2,
        }),
      }),
    )
  })

  test('APPLY_BOOK_OF_ASH copies non-elite discard cards and resurrects zombies', () => {
    const state = makeTestDuelState({
      phase: 'turn-end',
      pendingInstant: 'BOOK_OF_ASH',
      cards: [
        card('bookOfAsh', 'b1'),
        card('zombie', 'z1'),
        card('zombie', 'z2'),
      ],
      player1: { discard: ['b1', 'z1', 'z2'] },
    })

    const result = duelReducer(
      state,
      applyBookOfAsh({ targetCardInstanceId: 'z1' }),
    )

    expect(result.pendingInstant).toBeNull()
    expect(result.players['player1'].discard).toEqual(['b1'])
    expect(result.players['player1'].board).toEqual(
      expect.arrayContaining(['z1', 'z2']),
    )
    expect(result.players['player1'].board).toHaveLength(3)
  })

  test.each([
    {
      name: 'missing target',
      targetId: 'missing',
      expectedBoard: [],
    },
    {
      name: 'elite target',
      targetId: 's1',
      expectedBoard: [],
    },
  ])('APPLY_BOOK_OF_ASH is lost for $name', ({ targetId, expectedBoard }) => {
    const state = makeTestDuelState({
      pendingInstant: 'BOOK_OF_ASH',
      cards: [card('bookOfAsh', 'b1'), card('sachelman', 's1')],
      player1: { discard: ['b1', 's1'] },
    })

    const result = duelReducer(
      state,
      applyBookOfAsh({ targetCardInstanceId: targetId }),
    )

    expect(result.pendingInstant).toBeNull()
    expect(result.players['player1'].board).toEqual(expectedBoard)
  })
})

describe('combat reducers', () => {
  test('ATTACK_CARD damages defenders, spends temporary bonuses, and marks attackers acted', () => {
    const state = makeTestDuelState({
      cards: [
        card('zombie', 'z1', { nextAttackStrengthBonus: 1 }),
        card('haunt', 'h1'),
      ],
      player1: { board: ['z1'] },
      player2: { board: ['h1'] },
    })

    const result = duelReducer(
      state,
      attackCard({ attackerId: 'z1', defenderId: 'h1' }),
    )

    expect(result.cards['z1'].didAct).toBe(true)
    expect(
      result.cards['z1'].attributes.nextAttackStrengthBonus,
    ).toBeUndefined()
    expect(result.cards['h1'].attributes.life).toBe(2)
  })

  test('ATTACK_CARD defeats defenders and resets them before discard', () => {
    const state = makeTestDuelState({
      cards: [card('zombie', 'z1'), card('zombie', 'z2', { life: 1 })],
      player1: { board: ['z1'] },
      player2: { board: ['z2'] },
    })

    const result = duelReducer(
      state,
      attackCard({ attackerId: 'z1', defenderId: 'z2' }),
    )

    expect(result.players['player2'].board).toEqual([])
    expect(result.players['player2'].discard).toEqual(['z2'])
    expect(result.cards['z2'].attributes).toEqual(
      CARD_BASES['zombie'].attributes,
    )
  })

  test.each([
    {
      name: 'missing attacker',
      cards: [card('zombie', 'z2')],
      attackerId: 'missing',
      defenderId: 'z2',
    },
    {
      name: 'missing defender',
      cards: [card('zombie', 'z1')],
      attackerId: 'z1',
      defenderId: 'missing',
    },
    {
      name: 'stunned attacker',
      cards: [card('zombie', 'z1', { isStunned: true }), card('zombie', 'z2')],
      attackerId: 'z1',
      defenderId: 'z2',
    },
    {
      name: 'attacker that cannot attack',
      cards: [card('guardianStatue', 'g1'), card('zombie', 'z2')],
      attackerId: 'g1',
      defenderId: 'z2',
    },
  ])('ATTACK_CARD ignores $name', ({ cards, attackerId, defenderId }) => {
    const state = makeTestDuelState({
      cards,
      player1: { board: [attackerId] },
      player2: { board: [defenderId] },
    })

    const result = duelReducer(state, attackCard({ attackerId, defenderId }))

    expect(result).toEqual(state)
  })

  test('ATTACK_PLAYER damages inactive player, clamps at zero, and clears attack bonus', () => {
    const state = makeTestDuelState({
      cards: [card('zombie', 'z1', { nextAttackStrengthBonus: 2 })],
      player1: { board: ['z1'] },
      player2: { coins: 0 },
    })

    const result = duelReducer(state, attackPlayer({ attackerId: 'z1' }))

    expect(result.cards['z1'].didAct).toBe(true)
    expect(
      result.cards['z1'].attributes.nextAttackStrengthBonus,
    ).toBeUndefined()
    expect(result.players['player2'].coins).toBe(0)
  })

  test.each([
    {
      name: 'missing attacker',
      cards: [],
      attackerId: 'missing',
    },
    {
      name: 'stunned attacker',
      cards: [card('zombie', 'z1', { isStunned: true })],
      attackerId: 'z1',
    },
    {
      name: 'attacker that cannot attack',
      cards: [card('guardianStatue', 'g1')],
      attackerId: 'g1',
    },
  ])('ATTACK_PLAYER ignores $name', ({ cards, attackerId }) => {
    const state = makeTestDuelState({
      cards,
      player1: { board: [attackerId] },
      player2: { coins: 5 },
    })

    const result = duelReducer(state, attackPlayer({ attackerId }))

    expect(result).toEqual(state)
  })
})

describe('unknown action', () => {
  test('returns unchanged state', () => {
    const state = makeTestDuelState()

    expect(duelReducer(state, { type: 'UNKNOWN' })).toEqual(state)
  })
})
