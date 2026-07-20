import { defineCardBases } from './defineCardBases'

export const neutralBases = defineCardBases('neutral', {
  cook: {
    type: 'character',
    categories: ['servant'],
    rank: 'common',
    cost: 2,
    life: 1,
  },

  speedPotion: {
    type: 'instance',
    target: 'allied-hand-character',
    categories: ['alchemical', 'equipment'],
    rank: 'common',
    cost: 2,
  },

  flashBomb: {
    type: 'instance',
    target: 'enemy-board-character',
    categories: ['equipment'],
    rank: 'common',
    cost: 4,
  },
})
