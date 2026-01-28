import type { CardBaseId, CardInstance } from '@/types'
import { CARD_BASES } from '@/constants/cardBases'
import { getCardStrength } from '@/game-engine/utils'

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
    strength: strength ?? getCardStrength(base),
    base,
  }
}
