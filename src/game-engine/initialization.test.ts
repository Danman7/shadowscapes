import { describe, expect, test, vi, beforeEach } from 'vitest'
import {
  createInitialDuel,
  createDuel,
  getPlayer,
  updatePlayer,
} from '@/game-engine/initialization'
import * as utils from '@/game-engine/utils'
import { PLAYER_1_DECK, PLAYER_2_DECK } from '@/constants/testDecks'

// Mock the utils module to control shuffle and coinFlip
vi.mock('@/game-engine/utils', async () => {
  const actual = await vi.importActual<typeof utils>('@/game-engine/utils')
  return {
    ...actual,
    shuffle: vi.fn((arr) => [...arr]), // Default: return as-is
    coinFlip: vi.fn(() => true), // Default: player1 starts
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createInitialDuel', () => {
  test('creates placeholder duel with empty players', () => {
    const duel = createInitialDuel()

    expect(duel.phase).toBe('intro')
    expect(duel.startingPlayerId).toBeNull()
    expect(duel.activePlayerId).toBe('player1')
    expect(duel.inactivePlayerId).toBe('player2')
    expect(duel.cards).toEqual({})
    expect(duel.players.player1.name).toBe('')
    expect(duel.players.player2.name).toBe('')
    expect(duel.players.player1.deckIds).toEqual([])
    expect(duel.players.player2.deckIds).toEqual([])
  })

  test('creates players with zero coins', () => {
    const duel = createInitialDuel()

    expect(duel.players.player1.coins).toBe(0)
    expect(duel.players.player2.coins).toBe(0)
  })

  test('creates players with empty stacks', () => {
    const duel = createInitialDuel()

    expect(duel.players.player1.handIds).toEqual([])
    expect(duel.players.player1.boardIds).toEqual([])
    expect(duel.players.player1.discardIds).toEqual([])
    expect(duel.players.player2.handIds).toEqual([])
    expect(duel.players.player2.boardIds).toEqual([])
    expect(duel.players.player2.discardIds).toEqual([])
  })
})

describe('createDuel', () => {
  test('creates duel with player names', () => {
    const duel = createDuel({
      player1Name: 'Alice',
      player2Name: 'Bob',
      player1Deck: PLAYER_1_DECK,
      player2Deck: PLAYER_2_DECK,
    })

    expect(duel.players.player1.name).toBe('Alice')
    expect(duel.players.player2.name).toBe('Bob')
  })

  test('creates card instances from deck base IDs', () => {
    const duel = createDuel({
      player1Name: 'Alice',
      player2Name: 'Bob',
      player1Deck: ['zombie', 'haunt'],
      player2Deck: ['cook', 'novice'],
    })

    const totalCards = Object.keys(duel.cards).length
    expect(totalCards).toBe(4)
    expect(duel.players.player1.deckIds).toHaveLength(2)
    expect(duel.players.player2.deckIds).toHaveLength(2)
  })

  test('shuffles both decks', () => {
    const shuffleSpy = vi.mocked(utils.shuffle)

    createDuel({
      player1Name: 'Alice',
      player2Name: 'Bob',
      player1Deck: PLAYER_1_DECK,
      player2Deck: PLAYER_2_DECK,
    })

    expect(shuffleSpy).toHaveBeenCalledTimes(2)
    expect(shuffleSpy).toHaveBeenCalledWith(PLAYER_1_DECK)
    expect(shuffleSpy).toHaveBeenCalledWith(PLAYER_2_DECK)
  })

  test('resets instance ID counter before creating duel', () => {
    const resetSpy = vi.spyOn(utils, 'resetInstanceIdCounter')

    createDuel({
      player1Name: 'Alice',
      player2Name: 'Bob',
      player1Deck: ['zombie'],
      player2Deck: ['cook'],
    })

    expect(resetSpy).toHaveBeenCalledTimes(1)
  })

  describe('coin flip determines starting player', () => {
    test('player1 starts when coin flip returns true', () => {
      vi.mocked(utils.coinFlip).mockReturnValue(true)

      const duel = createDuel({
        player1Name: 'Alice',
        player2Name: 'Bob',
        player1Deck: PLAYER_1_DECK,
        player2Deck: PLAYER_2_DECK,
      })

      expect(duel.startingPlayerId).toBe('player1')
      expect(duel.activePlayerId).toBe('player1')
      expect(duel.inactivePlayerId).toBe('player2')
    })

    test('player2 starts when coin flip returns false', () => {
      vi.mocked(utils.coinFlip).mockReturnValue(false)

      const duel = createDuel({
        player1Name: 'Alice',
        player2Name: 'Bob',
        player1Deck: PLAYER_1_DECK,
        player2Deck: PLAYER_2_DECK,
      })

      expect(duel.startingPlayerId).toBe('player2')
      expect(duel.activePlayerId).toBe('player2')
      expect(duel.inactivePlayerId).toBe('player1')
    })
  })

  test('initializes phase to intro', () => {
    const duel = createDuel({
      player1Name: 'Alice',
      player2Name: 'Bob',
      player1Deck: PLAYER_1_DECK,
      player2Deck: PLAYER_2_DECK,
    })

    expect(duel.phase).toBe('intro')
  })

  test('initializes players with zero coins', () => {
    const duel = createDuel({
      player1Name: 'Alice',
      player2Name: 'Bob',
      player1Deck: PLAYER_1_DECK,
      player2Deck: PLAYER_2_DECK,
    })

    expect(duel.players.player1.coins).toBe(0)
    expect(duel.players.player2.coins).toBe(0)
  })

  test('initializes players with empty hand, board, and discard', () => {
    const duel = createDuel({
      player1Name: 'Alice',
      player2Name: 'Bob',
      player1Deck: PLAYER_1_DECK,
      player2Deck: PLAYER_2_DECK,
    })

    expect(duel.players.player1.handIds).toEqual([])
    expect(duel.players.player1.boardIds).toEqual([])
    expect(duel.players.player1.discardIds).toEqual([])
    expect(duel.players.player2.handIds).toEqual([])
    expect(duel.players.player2.boardIds).toEqual([])
    expect(duel.players.player2.discardIds).toEqual([])
  })
})

describe('getPlayer', () => {
  test('returns player1 by ID', () => {
    const duel = createInitialDuel()
    const player = getPlayer(duel, 'player1')

    expect(player.id).toBe('player1')
    expect(player).toBe(duel.players.player1)
  })

  test('returns player2 by ID', () => {
    const duel = createInitialDuel()
    const player = getPlayer(duel, 'player2')

    expect(player.id).toBe('player2')
    expect(player).toBe(duel.players.player2)
  })
})

describe('updatePlayer', () => {
  test('updates player name', () => {
    const duel = createInitialDuel()
    const updated = updatePlayer(duel, 'player1', { name: 'NewName' })

    expect(updated.players.player1.name).toBe('NewName')
    expect(updated.players.player2).toBe(duel.players.player2) // Unchanged
  })

  test('updates player coins', () => {
    const duel = createInitialDuel()
    const updated = updatePlayer(duel, 'player2', { coins: 5 })

    expect(updated.players.player2.coins).toBe(5)
    expect(updated.players.player1.coins).toBe(0) // Unchanged
  })

  test('updates player deck', () => {
    const duel = createInitialDuel()
    const updated = updatePlayer(duel, 'player1', { deckIds: [1, 2, 3] })

    expect(updated.players.player1.deckIds).toEqual([1, 2, 3])
  })

  test('does not mutate original duel', () => {
    const duel = createInitialDuel()
    const originalName = duel.players.player1.name

    updatePlayer(duel, 'player1', { name: 'NewName' })

    expect(duel.players.player1.name).toBe(originalName)
  })

  test('preserves other player properties', () => {
    const duel = createInitialDuel()
    duel.players.player1.handIds = [1, 2]
    duel.players.player1.coins = 3

    const updated = updatePlayer(duel, 'player1', { name: 'Updated' })

    expect(updated.players.player1.name).toBe('Updated')
    expect(updated.players.player1.handIds).toEqual([1, 2])
    expect(updated.players.player1.coins).toBe(3)
  })
})
