import { CardZones } from '@/state/duelConstants'
import {
  clone,
  flipCoinForFirstPlayer,
  generateRandomId,
  getZoneKey,
} from '@/state/utils'

describe('generateRandomId', () => {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  it('generates a random uuid', () => {
    const id = generateRandomId()
    expect(id).toMatch(uuidV4Regex)
  })

  it('generates unique valid uuids', () => {
    const count = 200
    const ids = Array.from({ length: count }, () => generateRandomId())
    expect(new Set(ids).size).toBe(count)
    ids.forEach((id) => expect(id).toMatch(uuidV4Regex))
  })
})

describe('getZoneKey', () => {
  it('returns the expected key format', () => {
    expect(getZoneKey('Player1', CardZones.Hand)).toBe('Player1:Hand')
    expect(getZoneKey('Player2', CardZones.Deck)).toBe('Player2:Deck')
  })
})

describe('clone', () => {
  it('deep clones nested objects and arrays', () => {
    const original = {
      a: 1,
      b: { c: 2 },
      d: [1, { e: 3 }],
      f: null as null | { g: number },
    }
    const copy = clone(original)

    expect(copy).toEqual(original)
    expect(copy).not.toBe(original)
    expect(copy.b).not.toBe(original.b)
    expect(copy.d).not.toBe(original.d)
    expect(copy.d[1]).not.toBe(original.d[1])
  })

  it('clones primitives transparently', () => {
    expect(clone(123)).toBe(123)
    expect(clone('abc')).toBe('abc')
    expect(clone(null)).toBeNull()
  })
})

describe('flipCoinForFirstPlayer', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns Player1 when Math.random() < 0.5', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1)
    expect(flipCoinForFirstPlayer()).toBe('Player1')
  })

  it('returns Player2 when Math.random() >= 0.5', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(flipCoinForFirstPlayer()).toBe('Player2')
  })
})
