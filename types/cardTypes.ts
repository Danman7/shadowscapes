import { CardCategories, CardDefinitionIds, CardRanks, Factions } from '@/data'

type CardCategory = (typeof CardCategories)[keyof typeof CardCategories]

export type Faction = (typeof Factions)[keyof typeof Factions]

export type CardRank = (typeof CardRanks)[keyof typeof CardRanks]

export type CardDefinitionId =
  (typeof CardDefinitionIds)[keyof typeof CardDefinitionIds]

type CardDefinitionBase = {
  id: CardDefinitionId
  cost: number
  categories: CardCategory[]
  faction: Faction
  constants: {
    name: string
    description: string | string[]
    flavor: string
    rank: CardRank
  }
}

export type CharacterDefinition = CardDefinitionBase & {
  kind: 'Character'
  strength: number
}

export type InstantDefinition = CardDefinitionBase & {
  kind: 'Instant'
}

export type CardDefinition = CharacterDefinition | InstantDefinition

export type DefinitionArgs<T extends CardDefinition> = Omit<
  T,
  'kind' | 'constants'
> & {
  constants: Pick<T['constants'], 'rank'>
}
