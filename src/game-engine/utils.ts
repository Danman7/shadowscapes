import type { CardBase, CardBaseId, CardInstance, PlayerId } from '@/types'
import { CARD_BASES } from '@/constants/cardBases'

let instanceIdCounter = 0

export const resetInstanceIdCounter = (): void => {
  instanceIdCounter = 0
}

export const generateInstanceId = (): number => instanceIdCounter++

export const getCardStrength = (base: CardBase): number | undefined => {
  return base.type === 'character' ? base.strength : undefined
}

export const createCardInstance = (
  baseId: CardBaseId,
  id?: number,
  strength?: number,
  counter?: number,
): CardInstance => ({
  id: id ?? generateInstanceId(),
  baseId,
  strength: strength ?? getCardStrength(CARD_BASES[baseId]),
  counter: counter ?? CARD_BASES[baseId].counter,
})

export const shuffle = <T>(
  array: T[],
  rng: () => number = Math.random,
): T[] => {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp
  }

  return shuffled
}

export const coinFlipForPlayerStart = (
  rng: () => number = Math.random,
): PlayerId => (rng() < 0.5 ? 'player1' : 'player2')
