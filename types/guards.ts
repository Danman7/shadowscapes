import { CardDefinition, CharacterDefinition } from '@/types'

export const isCharacter = (
  definition: CardDefinition,
): definition is CharacterDefinition => definition.kind === 'Character'
