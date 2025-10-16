import { getCardText } from '@/i18n'
import { CharacterDefinition, DefinitionArgs, InstantDefinition } from '@/types'

export const createCharacter = (
  definition: DefinitionArgs<CharacterDefinition>,
): CharacterDefinition => ({
  ...definition,
  kind: 'Character' as const,
  constants: {
    ...getCardText(definition.id),
  },
})

export const createInstant = (
  definition: DefinitionArgs<InstantDefinition>,
): InstantDefinition => ({
  ...definition,
  kind: 'Instant' as const,
  constants: {
    ...getCardText(definition.id),
  },
})
