import { DuelAction, DuelState } from 'src/modules/duel/types'
import {
  convertUsersToDuelPlayersAndCards,
  flipCoinForFirstPlayer,
} from 'src/modules/duel/utils'

export const initialState: DuelState = {
  activePlayerId: '',
  inactivePlayerId: '',
  phase: 'Intro Screen',
  players: {},
  cards: {},
}

export const duelReducer = (
  state: Readonly<DuelState>,
  action: DuelAction,
): DuelState => {
  switch (action.type) {
    case 'INITIALISE_DUEL': {
      const { users } = action

      const { cards, players } = convertUsersToDuelPlayersAndCards(users)
      const { activePlayerId, inactivePlayerId } = flipCoinForFirstPlayer(users)

      return {
        ...state,
        players,
        cards,
        activePlayerId,
        inactivePlayerId,
      }
    }

    case 'PROGRESS_TO_INITIAL_DRAW': {
      return {
        ...state,
        phase: 'Initial Draw',
      }
    }

    default:
      return state
  }
}
