import {
  getFactionBgClassName,
  getFactionTextClassName,
  getRankBorderClassName,
} from '@/components/utils'
import { CardRanks, Factions } from '@/data'

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
