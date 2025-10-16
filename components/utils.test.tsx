import { render } from '@testing-library/react'

import {
  getDescriptionParagraphs,
  getFactionBgClassName,
  getFactionTextClassName,
  getPlayerColorClassName,
  getRankBorderClassName,
  joinStringsWithComma,
} from '@/components/utils'
import { cardDefinitions, CardRanks, Factions } from '@/data'
import { DuelPlayerId } from '@/types'

describe('getFactionBgClassName', () => {
  it.each([
    [Factions.Order, 'bg-order'],
    [Factions.Chaos, 'bg-chaos'],
    [Factions.Shadow, 'bg-shadow'],
    [Factions.Neutral, 'bg-surface'],
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

describe('getDescriptionParagraphs', () => {
  it('should return JSX paragraphs for array input', () => {
    const descriptions = ['First paragraph', 'Second paragraph']
    const result = getDescriptionParagraphs(descriptions)
    const { container } = render(<div>{result}</div>)

    expect(container.querySelectorAll('p')).toHaveLength(2)
    expect(container.textContent).toContain('First paragraph')
    expect(container.textContent).toContain('Second paragraph')
  })

  it('should return string as-is for string input', () => {
    const description = 'Single description'
    const result = getDescriptionParagraphs(description)
    expect(result).toBe('Single description')
  })

  it('should handle empty array', () => {
    const result = getDescriptionParagraphs([])
    const { container } = render(<div>{result}</div>)
    expect(container.querySelectorAll('p')).toHaveLength(0)
  })
})

describe('getPlayerColorClassName', () => {
  it.each([
    ['Player1', 'text-first-player'],
    ['Player2', 'text-second-player'],
  ])('gets color for %s', (playerId, expected) => {
    expect(getPlayerColorClassName(playerId as DuelPlayerId)).toBe(expected)
  })
})
