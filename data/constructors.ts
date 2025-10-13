import { getCardText } from '@/i18n'
import { CharacterDefinition, DefinitionArgs, InstantDefinition } from '@/types'

export const character = (
  definition: DefinitionArgs<CharacterDefinition>,
): CharacterDefinition => ({
  ...definition,
  kind: 'Character' as const,
  constants: {
    rank: definition.constants.rank,
    ...getCardText(definition.id),
  },
})

export const instant = (
  definition: DefinitionArgs<InstantDefinition>,
): InstantDefinition => ({
  ...definition,
  kind: 'Instant' as const,
  constants: {
    rank: definition.constants.rank,
    ...getCardText(definition.id),
  },
})
