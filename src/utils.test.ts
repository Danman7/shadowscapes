import { formatNoun } from 'src/utils'

describe('formatNoun', () => {
  test('formats singular coin amount', () => {
    expect(formatNoun(1)).toBe('1 coin')
  })

  test('formats plural coin amount', () => {
    expect(formatNoun(2)).toBe('2 coins')
  })

  test('formats custom noun with pluralization', () => {
    expect(formatNoun(1, 'card')).toBe('1 card')
    expect(formatNoun(3, 'card')).toBe('3 cards')
  })
})
