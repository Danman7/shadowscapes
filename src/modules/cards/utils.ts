import { DefaultTheme } from 'styled-components/dist/types'

import { CardCategory, CardFaction } from 'src/modules/cards/types'

export const getFactionBackground = (
  faction: CardFaction,
  theme: DefaultTheme,
) => {
  const factionMap: Record<string, string> = {
    Order: theme.colors.faction.order,
    Chaos: theme.colors.faction.chaos,
    Shadow: theme.colors.faction.shadow,
  }

  return factionMap[faction] || theme.colors.text
}

export const joinCardCategories = (categories: CardCategory[]) =>
  categories.join(', ')
