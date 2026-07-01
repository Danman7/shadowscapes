// src/cards/bases/chaosBases.ts
import { defineCardBases } from './defineCardBases'

export const chaosBases = defineCardBases({
  zombie: {
    type: 'character',
    faction: 'chaos',
    categories: ['undead'],
    rank: 'common',
    cost: 1,
    life: 1,
  },
  haunt: {
    type: 'character',
    faction: 'chaos',
    categories: ['undead', 'hammerite'],
    rank: 'common',
    cost: 3,
    life: 3,
  },
  bookOfAsh: {
    type: 'instance',
    faction: 'chaos',
    categories: ['necromancer', 'artifact'],
    rank: 'elite',
    cost: 3,
  },
})
