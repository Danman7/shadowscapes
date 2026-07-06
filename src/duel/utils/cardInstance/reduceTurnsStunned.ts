import type { CharacterCardInstance } from '../../types'

export const reduceTurnsStunned = (character: CharacterCardInstance) => {
  if (character.turnsStunned > 0) character.turnsStunned -= 1
}
