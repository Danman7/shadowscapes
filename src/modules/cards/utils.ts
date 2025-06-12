import { DefaultTheme } from 'styled-components/dist/types'

import { CardCategory, CardFaction } from 'src/modules/cards/types'

export const getFactionBackground = (
  theme: DefaultTheme,
  faction?: CardFaction,
) => {
  const factionMap: Record<string, string> = {
    Order: theme.colors.faction.order,
    Chaos: theme.colors.faction.chaos,
    Shadow: theme.colors.faction.shadow,
  }

  return faction ? factionMap[faction] : theme.colors.text
}

export const joinCardCategories = (categories: CardCategory[]) =>
  categories.join(', ')
