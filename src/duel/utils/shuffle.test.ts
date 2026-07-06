import { shuffle } from './shuffle'

afterEach(() => {
  vi.restoreAllMocks()
})

test('shuffles the array in place', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
  const items = [1, 2, 3, 4]

  const result = shuffle(items)

  expect(result).toBe(items)
  expect(result).toEqual([2, 3, 4, 1])
})

test('preserves all items', () => {
  const result = shuffle([1, 2, 3, 4])

  expect(result).toHaveLength(4)
  expect([...result].sort()).toEqual([1, 2, 3, 4])
})
