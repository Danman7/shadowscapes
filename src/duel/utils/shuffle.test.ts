import { shuffle } from './shuffle'

afterEach(() => {
  vi.restoreAllMocks()
})

test('shuffles items without modifying the original array', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
  const items = [1, 2, 3, 4]

  expect(shuffle(items)).toEqual([2, 3, 4, 1])
  expect(items).toEqual([1, 2, 3, 4])
})

test('returns an empty or single-item array unchanged', () => {
  expect(shuffle([])).toEqual([])
  expect(shuffle(['only item'])).toEqual(['only item'])
})
