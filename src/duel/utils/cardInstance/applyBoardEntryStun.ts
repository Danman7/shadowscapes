import type { CharacterCardInstance } from '../../types'

export const applyBoardEntryStun = (character: CharacterCardInstance) => {
  if (character.traits.haste) return

  character.traits.stunned = (character.traits.stunned ?? 0) + 1
}
