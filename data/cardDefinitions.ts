import {
  CardCategories,
  CardDefinitionIds,
  CardRanks,
  character,
  Factions,
  instant,
} from '@/data'
import {
  CardDefinition,
  CardDefinitionId,
  CharacterDefinition,
  DefinitionArgs,
  InstantDefinition,
} from '@/types'

export const TempleGuardDefinition: DefinitionArgs<CharacterDefinition> = {
  id: CardDefinitionIds.TempleGuard,
  faction: Factions.Order,
  categories: [CardCategories.Hammerite],
  cost: 4,
  strength: 4,
  constants: {
    rank: CardRanks.Common,
  },
}

export const YoraSkullDefinition: DefinitionArgs<InstantDefinition> = {
  id: CardDefinitionIds.YoraSkull,
  faction: Factions.Order,
  categories: [CardCategories.Hammerite, CardCategories.Artifact],
  cost: 5,
  constants: {
    rank: CardRanks.Elite,
  },
}

export const cardDefinitions = {
  TempleGuard: character(TempleGuardDefinition),

  YoraSkull: instant(YoraSkullDefinition),

  Novice: character({
    id: CardDefinitionIds.Novice,
    faction: Factions.Order,
    categories: [CardCategories.Hammerite],
    cost: 2,
    strength: 2,
    constants: {
      rank: CardRanks.Common,
    },
  }),
} satisfies Record<CardDefinitionId, CardDefinition>
