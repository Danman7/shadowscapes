import type { CardBaseId, CardInstance } from '@/types'
import { CARD_BASES } from '@/constants/cardBases'

let instanceIdCounter = 0

/**
 * Resets the instance ID counter (useful for testing)
 */
export function resetInstanceIdCounter(): void {
  instanceIdCounter = 0
}

/**
 * Generates the next unique instance ID
 */
export function generateInstanceId(): number {
  return instanceIdCounter++
}

/**
 * Creates a card instance from a base ID
 */
export function createCardInstance(baseId: CardBaseId): CardInstance {
  const base = CARD_BASES[baseId]

  return {
    id: generateInstanceId(),
    baseId,
    type: base.type,
    strength: base.strength,
  }
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp
  }
  return shuffled
}

/**
 * Simulates a coin flip - returns true or false
 */
export function coinFlip(): boolean {
  return Math.random() < 0.5
}
