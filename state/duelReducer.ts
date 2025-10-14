import { DuelPhases } from '@/state/duelConstants'
import { DuelAction, DuelState } from '@/types'

export const duelReducer = (
  state: Readonly<DuelState>,
  action: DuelAction,
): DuelState => {
  switch (action.type) {
    case 'START_INITIAL_DRAW':
      return {
        ...state,
        phase: DuelPhases.InitialDraw,
      }

    default:
      return state
  }
}
