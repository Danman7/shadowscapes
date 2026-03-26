import { CARD_BASES, INITIAL_DUEL_STATE } from 'src/game-engine/constants'
import {
  addLogEntry,
  createCardInstance,
  createDuel,
  getOpponentId,
  getPendingInstant,
  resetCards,
  resetPlayers,
  updateCard,
  updatePlayers,
  type AttributeOverride,
} from 'src/game-engine/helpers'
import { makeTestDuel, MOCK_DUEL, MOCK_DUEL_SETUP } from 'src/game-engine/mocks'
import type { Duel, DuelLog } from 'src/game-engine/types'

const zombieBase = CARD_BASES['zombie']

describe('createCardInstance', () => {
  test('creates a card instance from card base', () => {
    const instance = createCardInstance('zombie')

    expect(instance.id).toBeDefined()
    expect(instance.base).toEqual(zombieBase)
    expect(instance.didAct).toBe(false)
    expect(instance.attributes).toEqual(zombieBase.attributes)
  })

  test('creates a card instance with predefined id', () => {
    const customId = 'zombie-1'
    const instance = createCardInstance('zombie', customId)

    expect(instance.id).toBe(customId)
  })

  test('creates a card instance with attribute overrides', () => {
    const customId = 'zombie-1'
    const customAttributes: AttributeOverride = {
      strength: 5,
      cost: 3,
    }
    const instance = createCardInstance('zombie', customId, customAttributes)

    expect(instance.id).toBe(customId)
    expect(instance.attributes.strength).toBe(customAttributes.strength)
    expect(instance.attributes.cost).toBe(customAttributes.cost)
    expect(instance.base.attributes.strength).toBe(
      zombieBase.attributes.strength,
    )
  })
})

describe('createDuel', () => {
  test('creates a duel with correct player setups', () => {
    const duelSetup = createDuel(MOCK_DUEL_SETUP)

    expect(duelSetup.playerOrder).toHaveLength(2)

    MOCK_DUEL_SETUP.forEach((playerSetup) => {
      const player = duelSetup.players[playerSetup.id]

      expect(player.name).toBe(playerSetup.name)
      expect(player.deck).toHaveLength(playerSetup.deck.length)
      expect(duelSetup.playerOrder).toContain(playerSetup.id)

      playerSetup.deck.forEach((baseId) => {
        expect(Object.values(duelSetup.cards)).toContainEqual(
          expect.objectContaining({ base: CARD_BASES[baseId] }),
        )
      })
    })
  })
})

describe('getOpponentId', () => {
  const playerOrder = MOCK_DUEL.playerOrder

  test('returns the opponent player id', () => {
    expect(getOpponentId(playerOrder, playerOrder[0])).toBe(playerOrder[1])
    expect(getOpponentId(playerOrder, playerOrder[1])).toBe(playerOrder[0])
  })
})

describe('getPendingInstant', () => {
  const baseState: Duel = {
    ...INITIAL_DUEL_STATE,
    cards: {
      zombie1: createCardInstance('zombie', 'zombie1'),
      zombie2: createCardInstance('zombie', 'zombie2'),
      speedPotion1: createCardInstance('speedPotion', 'speedPotion1'),
      flashBomb1: createCardInstance('flashBomb', 'flashBomb1'),
    },
    players: {
      player1: {
        ...MOCK_DUEL.players[MOCK_DUEL.playerOrder[0]],
        hand: ['zombie1'],
        board: [],
      },
      player2: {
        ...MOCK_DUEL.players[MOCK_DUEL.playerOrder[1]],
        hand: [],
        board: ['zombie2'],
      },
    },
    playerOrder: ['player1', 'player2'],
  }

  test('returns SPEED_POTION when speed potion played with characters in hand', () => {
    const card = baseState.cards['speedPotion1']

    expect(getPendingInstant(card, ['zombie1'], baseState)).toBe('SPEED_POTION')
  })

  test('returns null for speed potion when no characters in hand', () => {
    const card = baseState.cards['speedPotion1']

    expect(getPendingInstant(card, [], baseState)).toBeNull()
  })

  test('returns FLASH_BOMB when flash bomb played with cards on board', () => {
    const card = baseState.cards['flashBomb1']

    expect(getPendingInstant(card, [], baseState)).toBe('FLASH_BOMB')
  })

  test('returns null for flash bomb when no cards on board', () => {
    const card = baseState.cards['flashBomb1']
    const emptyBoardState: Duel = {
      ...baseState,
      players: {
        player1: { ...baseState.players['player1'], board: [] },
        player2: { ...baseState.players['player2'], board: [] },
      },
    }

    expect(getPendingInstant(card, [], emptyBoardState)).toBeNull()
  })

  test('returns null for non-instant cards', () => {
    const card = baseState.cards['zombie1']

    expect(getPendingInstant(card, ['zombie1'], baseState)).toBeNull()
  })
})

describe('resetPlayers', () => {
  test('resets playerReady status', () => {
    let players = MOCK_DUEL.players

    MOCK_DUEL.playerOrder.forEach((playerId) => {
      players[playerId].playerReady = true
    })

    const player = players

    expect(player[MOCK_DUEL.playerOrder[0]].playerReady).toBe(true)
    expect(player[MOCK_DUEL.playerOrder[1]].playerReady).toBe(true)

    const resetPlayersResult = resetPlayers(player)

    expect(resetPlayersResult[MOCK_DUEL.playerOrder[0]].playerReady).toBe(false)
    expect(resetPlayersResult[MOCK_DUEL.playerOrder[1]].playerReady).toBe(false)
  })
})

describe('addLogEntry', () => {
  test('adds a log entry to the duel logs', () => {
    const initialLogs: DuelLog[] = ['First log entry']

    const newLogEntry = 'Second log entry'
    const updatedLogs = addLogEntry(initialLogs, newLogEntry)

    expect(updatedLogs).toHaveLength(2)
    expect(updatedLogs[1]).toBe(newLogEntry)
  })
})

describe('updatePlayers', () => {
  const players = MOCK_DUEL.players
  const playerId = MOCK_DUEL.playerOrder[0]

  test('applies updater to the specified player', () => {
    const result = updatePlayers(players, playerId, (p) => ({
      ...p,
      coins: 99,
    }))

    expect(result[playerId].coins).toBe(99)
  })

  test('does not modify other players', () => {
    const otherPlayerId = MOCK_DUEL.playerOrder[1]

    const result = updatePlayers(players, playerId, (p) => ({
      ...p,
      coins: 99,
    }))

    expect(result[otherPlayerId]).toEqual(players[otherPlayerId])
  })
})

describe('resetCards', () => {
  test('resets didAct and stunned on all cards', () => {
    const cards = {
      card1: createCardInstance('zombie', 'card1'),
      card2: createCardInstance('zombie', 'card2'),
    }
    cards['card1'] = { ...cards['card1'], didAct: true }
    cards['card2'] = {
      ...cards['card2'],
      attributes: { ...cards['card2'].attributes, stunned: true },
    }

    const result = resetCards(cards)

    expect(result['card1'].didAct).toBe(false)
    expect(result['card2'].attributes.stunned).toBe(false)
  })

  test('preserves other card properties', () => {
    const cards = {
      card1: createCardInstance('zombie', 'card1', { life: 5, strength: 3 }),
    }

    const result = resetCards(cards)

    expect(result['card1'].attributes.life).toBe(5)
    expect(result['card1'].attributes.strength).toBe(3)
    expect(result['card1'].base).toEqual(cards['card1'].base)
    expect(result['card1'].id).toBe('card1')
  })
})

describe('updateCard', () => {
  const cards = {
    card1: createCardInstance('zombie', 'card1'),
    card2: createCardInstance('zombie', 'card2'),
  }

  test('applies updater to the specified card', () => {
    const result = updateCard(cards, 'card1', (c) => ({ ...c, didAct: true }))

    expect(result['card1'].didAct).toBe(true)
  })

  test('does not modify other cards', () => {
    const result = updateCard(cards, 'card1', (c) => ({ ...c, didAct: true }))

    expect(result['card2']).toEqual(cards['card2'])
  })

  test('can update card attributes', () => {
    const result = updateCard(cards, 'card1', (c) => ({
      ...c,
      attributes: { ...c.attributes, stunned: true },
    }))

    expect(result['card1'].attributes.stunned).toBe(true)
  })
})

describe('makeTestDuel', () => {
  test('creates a duel with default players and intro phase', () => {
    const duel = makeTestDuel()

    expect(duel.phase).toBe('intro')
    expect(duel.playerOrder).toEqual(['player1', 'player2'])
    expect(duel.players['player1'].name).toBe('Alice')
    expect(duel.players['player2'].name).toBe('Bob')
    expect(duel.logs).toEqual([])
    expect(duel.cards).toEqual({})
  })

  test('applies overrides to the default duel', () => {
    const card = createCardInstance('zombie', 'z1')
    const duel = makeTestDuel({
      phase: 'player-turn',
      cards: { z1: card },
    })

    expect(duel.phase).toBe('player-turn')
    expect(duel.cards['z1']).toEqual(card)
    expect(duel.players['player1'].name).toBe('Alice')
  })

  test('overrides players completely when provided', () => {
    const duel = makeTestDuel({
      players: {
        player1: {
          ...MOCK_DUEL.players[MOCK_DUEL.playerOrder[0]],
          id: 'player1',
          name: 'Custom',
        },
        player2: {
          ...MOCK_DUEL.players[MOCK_DUEL.playerOrder[1]],
          id: 'player2',
          name: 'Other',
        },
      },
    })

    expect(duel.players['player1'].name).toBe('Custom')
    expect(duel.players['player2'].name).toBe('Other')
  })
})
