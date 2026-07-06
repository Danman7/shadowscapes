export const factions = ['order', 'chaos', 'shadow', 'neutral'] as const

export type Faction = (typeof factions)[number]

export const ranks = ['common', 'elite'] as const

type Rank = (typeof ranks)[number]

export const categories = [
  'hammerite',
  'undead',
  'necromancer',
  'artifact',
  'beast',
] as const

type Category = (typeof categories)[number]

export interface SharedCardBase<TBaseId extends string = string> {
  baseId: TBaseId
  cost: number
  faction: Faction
  rank: Rank
  categories: readonly Category[]
}

export type InstanceCardBase<TBaseId extends string = string> =
  SharedCardBase<TBaseId> & {
    type: 'instance'
    target?: 'allied-character'
  }

export type CharacterCardBase<TBaseId extends string = string> =
  SharedCardBase<TBaseId> & {
    type: 'character'
    life: number
    strength?: number
    charges?: number
  }

export type CardBase<TBaseId extends string = string> =
  | InstanceCardBase<TBaseId>
  | CharacterCardBase<TBaseId>
