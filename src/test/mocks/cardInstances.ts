import type { CardBaseId, CardInstance } from '@/types'
import { CARD_BASES } from '@/constants/cardBases'

export function createCardInstance<T extends CardBaseId>(
  id: number,
  baseId: T,
  strength?: number,
): CardInstance & { base: (typeof CARD_BASES)[T] } {
  const base = CARD_BASES[baseId]

  return {
    id,
    baseId,
    type: base.type,
    strength: strength ?? base.strength,
    base,
  }
}
