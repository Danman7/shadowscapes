import '@testing-library/jest-dom'
import { describe, expect, test } from 'vitest'

import { createMockPlayer, createMockDuel } from '@/test/mocks/testHelpers'
import type { PlayerId, Phase } from '@/types'

describe('createMockPlayer', () => {
  test('creates a player with provided id', () => {
    const player = createMockPlayer('player1')

    expect(player.id).toBe('player1')
  })

  test('creates player1 with correct default name', () => {
    const player = createMockPlayer('player1')

    expect(player.name).toBe('Test Player 1')
  })

  test('creates player2 with correct default name', () => {
    const player = createMockPlayer('player2')

    expect(player.name).toBe('Test Player 2')
  })

  test('applies provided overrides to player', () => {
    const player = createMockPlayer('player1', {
      name: 'Custom Name',
      coins: 10,
    })

    expect(player.name).toBe('Custom Name')
    expect(player.coins).toBe(10)
    expect(player.id).toBe('player1')
  })

  test('initializes with empty stacks by default', () => {
    const player = createMockPlayer('player1')

    expect(player.deckIds).toEqual([])
    expect(player.handIds).toEqual([])
    expect(player.boardIds).toEqual([])
    expect(player.discardIds).toEqual([])
  })

  test('allows overriding stack arrays', () => {
    const player = createMockPlayer('player1', {
      deckIds: [1, 2, 3],
      handIds: [4, 5],
    })

    expect(player.deckIds).toEqual([1, 2, 3])
    expect(player.handIds).toEqual([4, 5])
  })

  test('initializes with 0 coins by default', () => {
    const player = createMockPlayer('player1')

    expect(player.coins).toBe(0)
  })
})

describe('createMockDuel', () => {
  test('creates a duel with default initial state', () => {
    const duel = createMockDuel()

    expect(duel.cards).toEqual({})
    expect(duel.phase).toBe('intro')
    expect(duel.startingPlayerId).toBeNull()
  })

  test('creates duel with both players', () => {
    const duel = createMockDuel()

    expect(duel.players.player1).toBeDefined()
    expect(duel.players.player2).toBeDefined()
    expect(duel.players.player1.id).toBe('player1')
    expect(duel.players.player2.id).toBe('player2')
  })

  test('sets active and inactive player ids', () => {
    const duel = createMockDuel()

    expect(duel.activePlayerId).toBe('player1')
    expect(duel.inactivePlayerId).toBe('player2')
  })

  test('applies provided overrides to duel', () => {
    const duel = createMockDuel({
      phase: 'player-turn' as Phase,
      startingPlayerId: 'player2' as PlayerId,
    })

    expect(duel.phase).toBe('player-turn')
    expect(duel.startingPlayerId).toBe('player2')
  })

  test('allows overriding player active states', () => {
    const duel = createMockDuel({
      activePlayerId: 'player2' as PlayerId,
      inactivePlayerId: 'player1' as PlayerId,
    })

    expect(duel.activePlayerId).toBe('player2')
    expect(duel.inactivePlayerId).toBe('player1')
  })

  test('allows adding cards to duel', () => {
    const duel = createMockDuel({
      cards: {
        1: {
          id: 1,
          baseId: 'zombie' as const,
          type: 'character' as const,
          strength: 2,
        },
      },
    })

    expect(duel.cards[1]).toBeDefined()
    expect(duel.cards[1]?.baseId).toBe('zombie')
  })

  test('preserves player names in overrides', () => {
    const duel = createMockDuel()

    expect(duel.players.player1.name).toBe('Test Player 1')
    expect(duel.players.player2.name).toBe('Test Player 2')
  })
})
