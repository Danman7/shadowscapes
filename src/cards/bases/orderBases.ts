import { defineCardBases } from './defineCardBases'

export const orderBases = defineCardBases({
  novice: {
    type: 'character',
    faction: 'order',
    categories: ['hammerite'],
    rank: 'common',
    cost: 1,
    life: 1,
  },
  templeGuard: {
    type: 'character',
    faction: 'order',
    categories: ['hammerite'],
    rank: 'common',
    cost: 3,
    life: 3,
  },
  yoraSkull: {
    type: 'instance',
    faction: 'order',
    categories: ['hammerite', 'artifact'],
    rank: 'elite',
    cost: 3,
  },
})
