import { describe, expect, test, beforeEach } from 'vitest'
import {
  resetInstanceIdCounter,
  generateInstanceId,
  createCardInstance,
  shuffle,
  coinFlip,
} from '@/game-engine/utils'

describe('resetInstanceIdCounter and generateInstanceId', () => {
  beforeEach(() => {
    resetInstanceIdCounter()
  })

  test('generateInstanceId increments counter', () => {
    expect(generateInstanceId()).toBe(0)
    expect(generateInstanceId()).toBe(1)
    expect(generateInstanceId()).toBe(2)
  })

  test('resetInstanceIdCounter resets counter to 0', () => {
    generateInstanceId()
    generateInstanceId()
    expect(generateInstanceId()).toBe(2)

    resetInstanceIdCounter()
    expect(generateInstanceId()).toBe(0)
  })
})

describe('createCardInstance', () => {
  beforeEach(() => {
    resetInstanceIdCounter()
  })

  test('creates character card instance from base', () => {
    const instance = createCardInstance('zombie')

    expect(instance.id).toBe(0)
    expect(instance.baseId).toBe('zombie')
    expect(instance.type).toBe('character')
    expect(instance.strength).toBe(1)
  })

  test('creates instant card instance from base', () => {
    const instance = createCardInstance('bookOfAsh')

    expect(instance.id).toBe(0)
    expect(instance.baseId).toBe('bookOfAsh')
    expect(instance.type).toBe('instant')
    expect(instance.strength).toBeUndefined()
  })

  test('generates unique IDs for each instance', () => {
    const instance1 = createCardInstance('zombie')
    const instance2 = createCardInstance('haunt')

    expect(instance1.id).toBe(0)
    expect(instance2.id).toBe(1)
  })
})

describe('shuffle', () => {
  test('returns shuffled array with same length', () => {
    const original = [1, 2, 3, 4, 5]
    const shuffled = shuffle(original, () => 0.5)

    expect(shuffled).toHaveLength(original.length)
    expect(original).toEqual([1, 2, 3, 4, 5])
  })

  test('returns array with same elements', () => {
    const original = ['a', 'b', 'c']
    const shuffled = shuffle(original, () => 0.5)

    expect(shuffled).toContain('a')
    expect(shuffled).toContain('b')
    expect(shuffled).toContain('c')
  })

  test('handles empty array', () => {
    const shuffled = shuffle([], () => 0.5)

    expect(shuffled).toEqual([])
  })

  test('handles single element array', () => {
    const shuffled = shuffle([1], () => 0.5)

    expect(shuffled).toEqual([1])
  })
})

describe('coinFlip', () => {
  test('returns false when random >= 0.5', () => {
    expect(coinFlip(() => 0.5)).toBe(false)
  })

  test('returns false when random equals 0.9', () => {
    expect(coinFlip(() => 0.9)).toBe(false)
  })
})
