import type { CharacterCardInstance } from '../../types'

export const decrementStun = (character: CharacterCardInstance) => {
  if (character.turnsStunned > 0) character.turnsStunned -= 1
}
