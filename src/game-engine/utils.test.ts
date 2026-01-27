import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest'
import {
  resetInstanceIdCounter,
  generateInstanceId,
  createCardInstance,
  shuffle,
  coinFlip,
} from '@/game-engine/utils'
import { mockMathRandom } from '@/test/mocks/testHelpers'

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
  let randomSpy: ReturnType<typeof vi.spyOn>

  afterEach(() => {
    randomSpy?.mockRestore()
  })

  test('returns shuffled array with same length', () => {
    randomSpy = mockMathRandom(0.5)
    const original = [1, 2, 3, 4, 5]
    const shuffled = shuffle(original)

    expect(shuffled).toHaveLength(original.length)
    expect(original).toEqual([1, 2, 3, 4, 5]) // Original unchanged
  })

  test('returns array with same elements', () => {
    randomSpy = mockMathRandom(0.5)
    const original = ['a', 'b', 'c']
    const shuffled = shuffle(original)

    expect(shuffled).toContain('a')
    expect(shuffled).toContain('b')
    expect(shuffled).toContain('c')
  })

  test('produces deterministic result with mocked random', () => {
    randomSpy = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.5)

    const original = [1, 2, 3, 4]
    const shuffled = shuffle(original)

    // With mocked values, shuffle should be deterministic
    // i=3: j=floor(0.9*4)=3, swap 4 with 4 -> [1,2,3,4]
    // i=2: j=floor(0.1*3)=0, swap 3 with 1 -> [3,2,1,4]
    // i=1: j=floor(0.5*2)=1, swap 2 with 2 -> [3,2,1,4]
    expect(shuffled).toEqual([3, 2, 1, 4])
  })

  test('handles empty array', () => {
    randomSpy = mockMathRandom(0.5)
    const shuffled = shuffle([])

    expect(shuffled).toEqual([])
  })

  test('handles single element array', () => {
    randomSpy = mockMathRandom(0.5)
    const shuffled = shuffle([1])

    expect(shuffled).toEqual([1])
  })
})

describe('coinFlip', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>

  afterEach(() => {
    randomSpy?.mockRestore()
  })

  test('returns true when random < 0.5', () => {
    randomSpy = mockMathRandom(0.4)
    expect(coinFlip()).toBe(true)
  })

  test('returns true when random equals 0', () => {
    randomSpy = mockMathRandom(0)
    expect(coinFlip()).toBe(true)
  })

  test('returns false when random >= 0.5', () => {
    randomSpy = mockMathRandom(0.5)
    expect(coinFlip()).toBe(false)
  })

  test('returns false when random equals 0.9', () => {
    randomSpy = mockMathRandom(0.9)
    expect(coinFlip()).toBe(false)
  })
})
