import { getCardBase, isCharacter } from '../../cards'
import type { CardBaseId } from '../../cards/bases'
import { generateUuid } from '../../shared/utils'
import { DEFAULT_CHARACTER_STRENGTH } from '../constants'
import type {
  CardInstance,
  CharacterCardInstance,
  PlayerId,
  Stack,
} from '../types'

export const createCardInstance = (
  baseId: CardBaseId,
  ownerId: PlayerId,
  stack: Stack,
): CardInstance => {
  const base = getCardBase(baseId)
  const shared = {
    id: generateUuid(),
    baseId,
    ownerId,
    stack,
    cost: base.cost,
  }

  if (!isCharacter(base)) return { ...shared, type: 'instance' }

  const character: CharacterCardInstance = {
    ...shared,
    type: 'character',
    life: base.life,
    strength: base.strength ?? DEFAULT_CHARACTER_STRENGTH,
    traits: { ...base.traits },
    didAct: false,
  }

  return character
}
