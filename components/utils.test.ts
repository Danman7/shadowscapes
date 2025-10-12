import {
  getFactionBgClassName,
  getFactionTextClassName,
  getRankBorderClassName,
  joinStringsWithComma,
} from '@/components/utils'
import { cardDefinitions, CardRanks, Factions } from '@/data'

describe('getFactionBgClassName', () => {
  it.each([
    [Factions.Order, 'bg-order'],
    [Factions.Chaos, 'bg-chaos'],
    [Factions.Shadow, 'bg-shadow'],
    [Factions.Neutral, ''],
  ])('gets color for %s', (faction, expected) => {
    expect(getFactionBgClassName(faction)).toBe(expected)
  })
})

describe('getFactionTextClassName', () => {
  it.each([
    [Factions.Order, 'text-surface'],
    [Factions.Chaos, 'text-surface'],
    [Factions.Shadow, 'text-surface'],
    [Factions.Neutral, 'text-foreground'],
  ])('gets color for %s', (faction, expected) => {
    expect(getFactionTextClassName(faction)).toBe(expected)
  })
})

describe('getRankBorderClassName', () => {
  it.each([
    [CardRanks.Common, 'border-foreground'],
    [CardRanks.Elite, 'border-elite'],
  ])('gets color for %s', (faction, expected) => {
    expect(getRankBorderClassName(faction)).toBe(expected)
  })
})

describe('joinStringsWithComma', () => {
  it('joins categories with comma and space', () => {
    expect(joinStringsWithComma(cardDefinitions.TempleGuard.categories)).toBe(
      'Hammerite, Guard',
    )
  })

  it('returns empty string for empty array', () => {
    expect(joinStringsWithComma([])).toBe('')
  })
})
