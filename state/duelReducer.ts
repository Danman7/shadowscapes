import { DuelPhases } from '@/state/duelConstants'
import {
  flipCoinForFirstPlayer,
  setInitialPlayersFromUserDecks,
} from '@/state/utils'
import { DuelAction, DuelState } from '@/types'

export const duelReducer = (
  state: Readonly<DuelState>,
  action: DuelAction,
): DuelState => {
  switch (action.type) {
    case 'START_DUEL': {
      return setInitialPlayersFromUserDecks(action.players)
    }

    case 'FLIP_COIN_FOR_FIRST_PLAYER': {
      return {
        ...state,
        activePlayerId: flipCoinForFirstPlayer(),
      }
    }

    case 'START_INITIAL_DRAW':
      return {
        ...state,
        phase: DuelPhases.InitialDraw,
      }

    default:
      return state
  }
}
