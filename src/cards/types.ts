export const factions = ['order', 'chaos', 'shadow', 'neutral'] as const

type Faction = (typeof factions)[number]

export const ranks = ['common', 'elite'] as const

type Rank = (typeof ranks)[number]

export const categories = ['hammerite', 'undead'] as const

type Category = (typeof categories)[number]

export interface CardBase {
  name: string
  cost: number
  faction: Faction
  rank: Rank
  categories: Category[]
}
