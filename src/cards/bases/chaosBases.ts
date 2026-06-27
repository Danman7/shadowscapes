// src/cards/bases/chaosBases.ts
import type { CardBase } from '../types'

export const chaosBases = {
  zombie: {
    name: 'Zombie',
    faction: 'chaos',
    categories: ['undead'],
    rank: 'common',
    cost: 1,
  },
  haunt: {
    name: 'Haunt',
    faction: 'chaos',
    categories: ['undead'],
    rank: 'common',
    cost: 3,
  },
} as const satisfies Record<string, CardBase>
