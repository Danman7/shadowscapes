import {
  CardCategories,
  CardDefinitionIds,
  CardRanks,
  createCharacter,
  Factions,
  createInstant,
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
  categories: [CardCategories.Hammerite, CardCategories.Guard],
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
  TempleGuard: createCharacter(TempleGuardDefinition),

  YoraSkull: createInstant(YoraSkullDefinition),

  Novice: createCharacter({
    id: CardDefinitionIds.Novice,
    faction: Factions.Order,
    categories: [CardCategories.Hammerite],
    cost: 2,
    strength: 2,
    constants: {
      rank: CardRanks.Common,
    },
  }),

  Haunt: createCharacter({
    id: CardDefinitionIds.Haunt,
    faction: Factions.Chaos,
    categories: [CardCategories.Undead],
    cost: 4,
    strength: 4,
    constants: {
      rank: CardRanks.Common,
    },
  }),

  Downwinder: createCharacter({
    id: CardDefinitionIds.Downwinder,
    faction: Factions.Shadow,
    categories: [CardCategories.Thief],
    cost: 3,
    strength: 3,
    constants: {
      rank: CardRanks.Common,
    },
  }),

  Cook: createCharacter({
    id: CardDefinitionIds.Cook,
    faction: Factions.Neutral,
    categories: [CardCategories.Servant],
    cost: 2,
    strength: 1,
    constants: {
      rank: CardRanks.Common,
    },
  }),

  Zombie: createCharacter({
    id: CardDefinitionIds.Zombie,
    faction: Factions.Chaos,
    categories: [CardCategories.Undead],
    cost: 1,
    strength: 1,
    constants: {
      rank: CardRanks.Common,
    },
  }),

  Apparition: createCharacter({
    id: CardDefinitionIds.Apparition,
    faction: Factions.Chaos,
    categories: [CardCategories.Undead],
    cost: 5,
    strength: 5,
    constants: {
      rank: CardRanks.Common,
    },
  }),

  [CardDefinitionIds.AzaranTheCruel]: createCharacter({
    id: CardDefinitionIds.AzaranTheCruel,
    faction: Factions.Chaos,
    categories: [CardCategories.Necromancer],
    cost: 8,
    strength: 3,
    constants: {
      rank: CardRanks.Elite,
    },
  }),

  BrotherSachelman: createCharacter({
    id: CardDefinitionIds.BrotherSachelman,
    faction: Factions.Order,
    categories: [CardCategories.Hammerite],
    cost: 5,
    strength: 3,
    constants: {
      rank: CardRanks.Elite,
    },
  }),

  ElevatedAcolyte: createCharacter({
    id: CardDefinitionIds.ElevatedAcolyte,
    faction: Factions.Order,
    categories: [CardCategories.Hammerite],
    cost: 2,
    strength: 3,
    constants: {
      rank: CardRanks.Common,
    },
  }),
} satisfies Record<CardDefinitionId, CardDefinition>
