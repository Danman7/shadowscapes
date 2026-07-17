// src/cards/bases/chaosBases.ts
import { defineCardBases } from './defineCardBases'

export const chaosBases = defineCardBases('chaos', {
  zombie: {
    type: 'character',
    categories: ['undead'],
    rank: 'common',
    cost: 1,
    life: 1,
  },
  burrick: {
    type: 'character',
    categories: ['beast'],
    rank: 'common',
    cost: 2,
    life: 2,
    charges: 1,
  },
  haunt: {
    type: 'character',
    categories: ['undead', 'hammerite'],
    rank: 'common',
    cost: 3,
    life: 3,
    strength: 2,
  },
  bookOfAsh: {
    type: 'instance',
    target: 'discarded-character',
    categories: ['necromancer', 'artifact'],
    rank: 'elite',
    cost: 3,
  },
  viktoriaQueen: {
    type: 'character',
    categories: ['pagan'],
    rank: 'elite',
    life: 2,
    cost: 5,
  },
})
