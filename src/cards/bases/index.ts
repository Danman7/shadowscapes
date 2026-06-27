// src/cards/bases/index.ts
import { chaosBases } from './chaosBases'
import { orderBases } from './orderBases'

export const cardBases = {
  ...orderBases,
  ...chaosBases,
} as const

export type CardBaseId = keyof typeof cardBases

export const cardBaseIds = Object.keys(cardBases) as CardBaseId[]

export const getCardBase = (baseId: CardBaseId) => cardBases[baseId]
