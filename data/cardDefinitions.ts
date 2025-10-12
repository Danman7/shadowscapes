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

  Haunt: character({
    id: CardDefinitionIds.Haunt,
    faction: Factions.Chaos,
    categories: [CardCategories.Undead],
    cost: 4,
    strength: 4,
    constants: {
      rank: CardRanks.Common,
    },
  }),

  Downwinder: character({
    id: CardDefinitionIds.Downwinder,
    faction: Factions.Shadow,
    categories: [CardCategories.Thief],
    cost: 3,
    strength: 3,
    constants: {
      rank: CardRanks.Common,
    },
  }),

  Cook: character({
    id: CardDefinitionIds.Cook,
    faction: Factions.Neutral,
    categories: [CardCategories.Servant],
    cost: 2,
    strength: 1,
    constants: {
      rank: CardRanks.Common,
    },
  }),
} satisfies Record<CardDefinitionId, CardDefinition>
