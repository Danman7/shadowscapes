import { CardDefinition, CharacterDefinition } from '@/types'

/**
 * Type guard function that checks if a card definition is a character definition.
 *
 * @param definition - The card definition to check
 * @returns True if the definition is a CharacterDefinition, false otherwise
 */
export const isCharacter = (
  definition: CardDefinition,
): definition is CharacterDefinition => definition.kind === 'Character'
