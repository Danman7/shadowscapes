import { getCardText } from '@/i18n'
import { CharacterDefinition, DefinitionArgs, InstantDefinition } from '@/types'

/**
 * Creates a character definition with default properties and card text.
 *
 * @param definition - The character definition object without 'kind' and 'constants' properties, but including a 'constants' object with a 'rank' property
 *
 * @returns A complete CharacterDefinition object with:
 *          - kind set to 'Character'
 *          - constants merged with rank and card text from getCardText()
 *          - all other properties from the input definition
 */
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

/**
 * Creates an instant card definition with the specified properties.
 *
 * @param definition - The instant card definition object excluding 'kind' and 'constants' fields, but including a 'constants' object with at least a 'rank' property
 *
 * @returns A complete InstantDefinition object with 'kind' set to 'Instant' and merged constants
 */
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
