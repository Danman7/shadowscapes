import { DuelAction, DuelState } from 'src/modules/duel/types'
import { convertUsersToDuelPlayersAndCards } from 'src/modules/duel/utils'

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
      const [cards, players] = convertUsersToDuelPlayersAndCards(action.users)

      return {
        ...state,
        players,
        cards,
      }
    }

    default:
      return state
  }
}
