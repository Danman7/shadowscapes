// src/cards/bases/index.ts
import { chaosBases } from './chaosBases'
import { orderBases } from './orderBases'
import type { CardBase } from '../types'
import { neutralBases } from './neutralBases'

export * from './orderConstants'

export const cardBases = {
  ...orderBases,
  ...chaosBases,
  ...neutralBases,
} as const

export type CardBaseId = keyof typeof cardBases
export type KnownCardBase = CardBase<CardBaseId>

export const cardBaseIds = Object.keys(cardBases) as CardBaseId[]

export const getCardBase = (baseId: CardBaseId) => cardBases[baseId]
