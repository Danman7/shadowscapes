import type { AttackCharacterPayload } from '../../state/duelStateTypes'
import type { DuelState } from '../../types'
import { isCharacterInstance } from '../cardInstance'

export const canCharacterAttack = (
  state: DuelState,
  { attackerId, defenderId }: AttackCharacterPayload,
): boolean => {
  if (state.phase !== 'act' || !state.actPlayerId) return false

  const attacker = state.cards[attackerId]
  const defender = state.cards[defenderId]
  const attackerPlayer = state.players[state.actPlayerId]
  const defenderPlayer = defender
    ? state.players[defender.ownerId]
    : undefined

  return Boolean(
    isCharacterInstance(attacker) &&
      isCharacterInstance(defender) &&
      attacker.ownerId === state.actPlayerId &&
      defender.ownerId !== attacker.ownerId &&
      attacker.stack === 'board' &&
      defender.stack === 'board' &&
      attackerPlayer?.board.includes(attackerId) &&
      defenderPlayer?.board.includes(defenderId) &&
      !attackerPlayer.hasActedThisPhase &&
      (attacker.traits.stunned ?? 0) === 0 &&
      !attacker.didAct,
  )
}
