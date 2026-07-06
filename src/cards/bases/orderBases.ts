import { defineCardBases } from './defineCardBases'

export const orderBases = defineCardBases('order', {
  novice: {
    type: 'character',
    categories: ['hammerite'],
    rank: 'common',
    cost: 1,
    life: 1,
  },
  acolyte: {
    type: 'character',
    categories: ['hammerite'],
    rank: 'common',
    cost: 2,
    life: 2,
  },
  templeGuard: {
    type: 'character',
    categories: ['hammerite'],
    rank: 'common',
    cost: 3,
    life: 3,
    strength: 2,
  },
  yoraSkull: {
    type: 'instance',
    target: 'allied-character',
    categories: ['hammerite', 'artifact'],
    rank: 'elite',
    cost: 3,
  },
})
