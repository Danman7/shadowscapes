import { DuelAction, DuelState } from 'src/modules/duel/types'
import {
  convertUsersToDuelPlayersAndCards,
  flipCoinForFirstPlayer,
} from 'src/modules/duel/utils'

export const initialState: DuelState = {
  activePlayerId: '',
  inactivePlayerId: '',
  phase: 'Pre-duel',
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

    default:
      return state
  }
}
