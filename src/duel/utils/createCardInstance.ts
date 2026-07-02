import type { CardBaseId } from '../../cards/bases'
import { generateUuid } from '../../shared/utils'
import type { CardInstance, PlayerId, Stack } from '../types'

export const createCardInstance = (
  baseId: CardBaseId,
  ownerId: PlayerId,
  stack: Stack,
): CardInstance => ({
  id: generateUuid(),
  baseId,
  ownerId,
  stack,
})
