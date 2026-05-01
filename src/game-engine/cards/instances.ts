import { CARD_BASES } from 'src/game-engine/constants'
import type {
  CardAttributes,
  CardBaseId,
  CardInstance,
} from 'src/game-engine/types'

export type AttributeOverride = Partial<CardAttributes>

export const generateUuid = (): string => crypto.randomUUID()

export const createCardInstance = (
  baseId: CardBaseId,
  id?: string,
  attributeOverrides?: AttributeOverride,
): CardInstance => {
  const base = CARD_BASES[baseId]

  return {
    id: id ?? generateUuid(),
    base,
    attributes: { ...base.attributes, ...attributeOverrides },
    didAct: false,
  }
}
