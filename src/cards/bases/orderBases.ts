import type { CardBase } from '../types'

export const orderBases = {
  novice: {
    name: 'Novice',
    faction: 'order',
    categories: ['hammerite'],
    rank: 'common',
    cost: 1,
  },
  templeGuard: {
    name: 'Temple Guard',
    faction: 'order',
    categories: ['hammerite'],
    rank: 'common',
    cost: 3,
  },
} as const satisfies Record<string, CardBase>
