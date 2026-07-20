import type { CharacterCardInstance } from '../../types'

export const reduceTurnsStunned = (character: CharacterCardInstance) => {
  const stunned = character.traits.stunned ?? 0

  if (stunned <= 1) {
    delete character.traits.stunned
    return
  }

  character.traits.stunned = stunned - 1
}
