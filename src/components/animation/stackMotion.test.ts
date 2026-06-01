import { getNewItemIds } from 'src/components/animation'

describe('getNewItemIds', () => {
  test('returns ids that were not in the previous list', () => {
    expect(getNewItemIds(['a', 'b'], ['b', 'c', 'd'])).toEqual(['c', 'd'])
  })

  test('preserves current order for new ids', () => {
    expect(getNewItemIds(['a'], ['c', 'a', 'b'])).toEqual(['c', 'b'])
  })

  test('returns an empty list when ids are only reordered', () => {
    expect(getNewItemIds(['a', 'b'], ['b', 'a'])).toEqual([])
  })
})
