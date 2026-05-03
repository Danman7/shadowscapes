import type { CardAttributes } from 'src/game-engine'

export const CARD_ATTRIBUTE_KEYS: (keyof CardAttributes)[] = [
  'cost',
  'life',
  'strength',
  'charges',
  'hasHaste',
  'isStunned',
  'isHidden',
]
