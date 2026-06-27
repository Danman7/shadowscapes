import type { CardBase } from '../types'

export const orderBases = {
  novice: {
    type: 'character',
    name: 'Novice',
    faction: 'order',
    categories: ['hammerite'],
    rank: 'common',
    cost: 1,
    life: 1,
  },
  templeGuard: {
    type: 'character',
    name: 'Temple Guard',
    faction: 'order',
    categories: ['hammerite'],
    rank: 'common',
    cost: 3,
    life: 3,
  },
  yoraSkull: {
    type: 'instance',
    name: "st. Yora's Skull",
    faction: 'order',
    categories: ['hammerite', 'artifact'],
    rank: 'elite',
    cost: 3,
  },
} as const satisfies Record<string, CardBase>
