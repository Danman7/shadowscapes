import type {
  CardInstanceId,
  CharacterCardInstance,
  DuelState,
} from '../../types'

export const isCharacterInstance = (
  card: DuelState['cards'][CardInstanceId] | undefined,
): card is CharacterCardInstance => card?.type === 'character'
