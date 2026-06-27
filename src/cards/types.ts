export const factions = ['order', 'chaos', 'shadow', 'neutral'] as const

type Faction = (typeof factions)[number]

export const ranks = ['common', 'elite'] as const

type Rank = (typeof ranks)[number]

export const categories = [
  'hammerite',
  'undead',
  'necromancer',
  'artifact',
] as const

type Category = (typeof categories)[number]

export interface SharedCardBase {
  name: string
  cost: number
  faction: Faction
  rank: Rank
  categories: readonly Category[]
}

export type InstanceCardBase = SharedCardBase & {
  type: 'instance'
}

export type CharacterCardBase = SharedCardBase & {
  type: 'character'
  life: number
}

export type CardBase = InstanceCardBase | CharacterCardBase
