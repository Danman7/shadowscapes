import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  type AttributeOverride,
  createCardInstance,
  createDuel,
} from 'src/game-engine/cards'
import { CARD_BASES, INITIAL_DUEL_STATE } from 'src/game-engine/constants'
import {
  addLog,
  drawCards,
  getCardsInStack,
  getOpponentId,
  getPendingInstant,
  hasCardInStack,
  resetCharacterAttributes,
  resetPlayersReady,
  updateCard,
  updatePlayers,
} from 'src/game-engine/utils'
import {
  makeTestCard,
  makeTestCards,
  makeTestDuelState,
  makeTestPlayer,
  MOCK_DUEL_SETUP,
} from 'src/game-engine/testing'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('card instances', () => {
  test('creates mutable card instances from immutable card bases', () => {
    const attributes: AttributeOverride = { cost: 3, strength: 5 }
    const instance = createCardInstance('zombie', 'zombie-1', attributes)

    expect(instance).toEqual(
      expect.objectContaining({
        id: 'zombie-1',
        base: CARD_BASES['zombie'],
        didAct: false,
      }),
    )
    expect(instance.attributes).toEqual({
      ...CARD_BASES['zombie'].attributes,
      ...attributes,
    })
    expect(CARD_BASES['zombie'].attributes.strength).not.toBe(
      attributes.strength,
    )
  })
})

describe('duel factory', () => {
  test('creates players, card instances, starting order, and deck logs', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1)

    const duel = createDuel(MOCK_DUEL_SETUP)

    expect(duel.phase).toBe(INITIAL_DUEL_STATE.phase)
    expect(duel.playerOrder).toEqual(['player1', 'player2'])
    expect(duel.players['player1'].deck).toHaveLength(
      MOCK_DUEL_SETUP[0].deck.length,
    )
    expect(duel.players['player2'].deck).toHaveLength(
      MOCK_DUEL_SETUP[1].deck.length,
    )
    expect(Object.values(duel.cards).map((card) => card.base.id)).toEqual(
      expect.arrayContaining([...MOCK_DUEL_SETUP[0].deck]),
    )
    expect(duel.logs).toHaveLength(2)
  })
})

describe('game queries', () => {
  const cards = makeTestCards(
    makeTestCard('zombie', 'zombie1'),
    makeTestCard('haunt', 'haunt1'),
    makeTestCard('speedPotion', 'speedPotion1'),
    makeTestCard('flashBomb', 'flashBomb1'),
    makeTestCard('bookOfAsh', 'bookOfAsh1'),
  )

  test('gets opponent from either side of player order', () => {
    expect(getOpponentId(['player1', 'player2'], 'player1')).toBe('player2')
    expect(getOpponentId(['player1', 'player2'], 'player2')).toBe('player1')
  })

  test('filters stack ids by existing matching cards', () => {
    const characterIds = getCardsInStack(
      ['zombie1', 'speedPotion1', 'missing'],
      cards,
      (card) => card.base.type === 'Character',
    )

    expect(characterIds).toEqual(['zombie1'])
    expect(
      hasCardInStack(['speedPotion1', 'zombie1'], cards, (card) => {
        return card.base.id === 'zombie'
      }),
    ).toBe(true)
    expect(
      hasCardInStack(['speedPotion1'], cards, (card) => {
        return card.base.type === 'Character'
      }),
    ).toBe(false)
  })

  test.each([
    {
      cardId: 'speedPotion1',
      hand: ['zombie1'],
      player2Board: [],
      expected: 'SPEED_POTION',
    },
    {
      cardId: 'speedPotion1',
      hand: [],
      player2Board: [],
      expected: null,
    },
    {
      cardId: 'flashBomb1',
      hand: [],
      player2Board: ['zombie1'],
      expected: 'FLASH_BOMB',
    },
    {
      cardId: 'flashBomb1',
      hand: [],
      player2Board: [],
      expected: null,
    },
    {
      cardId: 'bookOfAsh1',
      hand: [],
      player2Board: [],
      expected: 'BOOK_OF_ASH',
    },
    {
      cardId: 'zombie1',
      hand: ['zombie1'],
      player2Board: [],
      expected: null,
    },
  ] as const)(
    'gets pending instant for $cardId with available targets',
    ({ cardId, hand, player2Board, expected }) => {
      const state = makeTestDuelState({
        cards,
        player1: { hand: [...hand] },
        player2: { board: [...player2Board] },
      })

      expect(getPendingInstant(cards[cardId], [...hand], [], state)).toBe(
        expected,
      )
    },
  )
})

describe('state utilities', () => {
  test('draws cards from deck to hand up to the requested amount', () => {
    const player = makeTestPlayer('player1', {
      hand: ['hand1'],
      deck: ['deck1', 'deck2'],
    })

    drawCards(player, 3)

    expect(player.hand).toEqual(['hand1', 'deck1', 'deck2'])
    expect(player.deck).toEqual([])
  })

  test('resets mutable character attributes to their base values', () => {
    const woundedZombie = makeTestCard('zombie', 'z1', {
      attributes: { life: 0, hasHaste: true },
      didAct: true,
    })

    expect(resetCharacterAttributes(woundedZombie)).toEqual({
      ...woundedZombie,
      attributes: CARD_BASES['zombie'].attributes,
    })
  })

  test('leaves instant card attributes unchanged when reset is requested', () => {
    const speedPotion = makeTestCard('speedPotion', 's1')

    expect(resetCharacterAttributes(speedPotion)).toBe(speedPotion)
  })

  test('updates targeted players and cards without changing other entries', () => {
    const players = {
      player1: makeTestPlayer('player1'),
      player2: makeTestPlayer('player2'),
    }
    const cards = makeTestCards(
      makeTestCard('zombie', 'z1'),
      makeTestCard('haunt', 'h1'),
    )

    const updatedPlayers = updatePlayers(players, 'player1', (player) => ({
      ...player,
      coins: 99,
    }))
    const updatedCards = updateCard(cards, 'z1', (card) => ({
      ...card,
      didAct: true,
    }))

    expect(updatedPlayers['player1'].coins).toBe(99)
    expect(updatedPlayers['player2']).toEqual(players['player2'])
    expect(updatedCards['z1'].didAct).toBe(true)
    expect(updatedCards['h1']).toEqual(cards['h1'])
  })

  test('resets all players ready and appends logs through state helpers', () => {
    const state = makeTestDuelState({
      player1: { playerReady: true },
      player2: { playerReady: true },
    })

    resetPlayersReady(state)
    addLog(state, 'A quiet footstep.')

    expect(state.players['player1'].playerReady).toBe(false)
    expect(state.players['player2'].playerReady).toBe(false)
    expect(state.logs).toEqual(['A quiet footstep.'])
  })
})
