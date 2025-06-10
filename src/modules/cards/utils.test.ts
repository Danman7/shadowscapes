import { orderCardBases } from 'src/modules/cards/bases/order'
import { CardFaction } from 'src/modules/cards/types'
import {
  getFactionBackground,
  joinCardCategories,
} from 'src/modules/cards/utils'
import { theme } from 'src/theme'

describe('getFactionBackground', () => {
  it('returns correct color for Order', () => {
    expect(getFactionBackground('Order' as CardFaction, theme)).toBe(
      theme.colors.faction.order,
    )
  })

  it('returns correct color for Chaos', () => {
    expect(getFactionBackground('Chaos' as CardFaction, theme)).toBe(
      theme.colors.faction.chaos,
    )
  })

  it('returns correct color for Shadow', () => {
    expect(getFactionBackground('Shadow' as CardFaction, theme)).toBe(
      theme.colors.faction.shadow,
    )
  })

  it('returns theme.colors.text for unknown faction', () => {
    expect(getFactionBackground('Unknown' as CardFaction, theme)).toBe(
      theme.colors.text,
    )
  })
})

describe('joinCardCategories', () => {
  it('joins categories with comma and space', () => {
    expect(joinCardCategories(orderCardBases.templeGuard.categories)).toBe(
      'Guard, Hammerite',
    )
  })

  it('returns empty string for empty array', () => {
    expect(joinCardCategories([])).toBe('')
  })
})
