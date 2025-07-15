import { shuffleArray } from 'src/utils'

describe('shuffleArray', () => {
  it('should return an array of the same length', () => {
    const array = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(array)

    expect(shuffled.length).toBe(array.length)
  })

  it('should contain all the same elements', () => {
    const array = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(array)

    array.forEach((item) => {
      expect(shuffled).toContain(item)
    })

    shuffled.forEach((item) => {
      expect(array).toContain(item)
    })
  })

  it('should change the order of elements most of the time', () => {
    const array = Array.from({ length: 20 }, (_, i) => i)

    const results = Array.from({ length: 5 }, () => shuffleArray([...array]))

    const allSame = results.every((result) =>
      result.every((item, i) => item === array[i]),
    )

    expect(allSame).toBe(false)
  })

  it('should not modify the original array', () => {
    const array = [1, 2, 3, 4, 5]
    const originalArray = [...array]

    shuffleArray(array)

    expect(array).toEqual(originalArray)
  })
})
