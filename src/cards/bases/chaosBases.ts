// src/cards/bases/chaosBases.ts
import type { CardBase } from '../types'

export const chaosBases = {
  zombie: {
    type: 'character',
    name: 'Zombie',
    faction: 'chaos',
    categories: ['undead'],
    rank: 'common',
    cost: 1,
    life: 1,
  },
  haunt: {
    type: 'character',
    name: 'Haunt',
    faction: 'chaos',
    categories: ['undead'],
    rank: 'common',
    cost: 3,
    life: 3,
  },
  bookOfAsh: {
    type: 'instance',
    name: 'Book of Ash',
    faction: 'chaos',
    categories: ['necromancer', 'artifact'],
    rank: 'elite',
    cost: 3,
  },
} as const satisfies Record<string, CardBase>
