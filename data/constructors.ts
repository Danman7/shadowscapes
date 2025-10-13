import { getCardText } from '@/i18n'
import { CharacterDefinition, DefinitionArgs, InstantDefinition } from '@/types'

export const createCharacter = (
  definition: DefinitionArgs<CharacterDefinition>,
): CharacterDefinition => ({
  ...definition,
  kind: 'Character' as const,
  constants: {
    rank: definition.constants.rank,
    ...getCardText(definition.id),
  },
})

export const createInstant = (
  definition: DefinitionArgs<InstantDefinition>,
): InstantDefinition => ({
  ...definition,
  kind: 'Instant' as const,
  constants: {
    rank: definition.constants.rank,
    ...getCardText(definition.id),
  },
})
