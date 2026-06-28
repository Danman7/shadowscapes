import type { CardBase, CharacterCardBase } from '../types'

export const isCharacter = (card: CardBase): card is CharacterCardBase =>
  card.type === 'character'
