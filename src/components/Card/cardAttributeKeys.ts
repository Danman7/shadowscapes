import type { CardAttributes } from 'src/game-engine'

export const CARD_ATTRIBUTE_KEYS = [
  'cost',
  'life',
  'strength',
  'charges',
  'hasHaste',
  'cannotAttack',
  'retaliates',
  'isStunned',
  'isHidden',
] as const satisfies ReadonlyArray<keyof CardAttributes>

export type CardAttributeKey = (typeof CARD_ATTRIBUTE_KEYS)[number]
