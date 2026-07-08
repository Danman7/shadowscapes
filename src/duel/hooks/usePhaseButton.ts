import { messages } from '../../l10n/en'
import { passActTurn, passPlayTurn } from '../state'
import { canActPlayerPass, isPlayerHumanControlled } from '../utils'
import { useCombatInteraction } from './useCombatInteraction'
import { useDuelDispatch } from './useDuelDispatch'
import { useDuelState } from './useDuelState'

interface PhaseButtonOptions {
  label: string
  onClick: () => void
}

export const usePhaseButton = (): PhaseButtonOptions | null => {
  const dispatch = useDuelDispatch()
  const duelState = useDuelState()
  const combatInteraction = useCombatInteraction()
  const { phase, playerOrder, players } = duelState
  const activePlayer = players[playerOrder[0]]

  if (
    phase === 'play' &&
    isPlayerHumanControlled(duelState, activePlayer.id) &&
    !activePlayer.hasActedThisPhase
  ) {
    return {
      label: messages.ui.passLabel,
      onClick: () => dispatch(passPlayTurn()),
    }
  }

  if (
    phase === 'act' &&
    duelState.actPlayerId &&
    isPlayerHumanControlled(duelState, duelState.actPlayerId) &&
    !combatInteraction.isAttackPending &&
    canActPlayerPass(duelState)
  ) {
    return {
      label: messages.ui.passLabel,
      onClick: () => {
        combatInteraction.clearSelection()
        dispatch(passActTurn())
      },
    }
  }

  return null
}
