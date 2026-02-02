import '@testing-library/jest-dom'
import { describe, expect, test } from 'vitest'

import { createMockPlayer } from '@/test/mocks/testHelpers'

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
