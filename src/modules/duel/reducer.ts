import { formatString, messages } from 'src/i18n'
import { INITIAL_CARDS_DRAWN_AMOUNT } from 'src/modules/duel/constants'
import { DuelAction, DuelState } from 'src/modules/duel/types'
import {
  convertUsersToDuelPlayersAndCards,
  drawCards,
  flipCoinForFirstPlayer,
} from 'src/modules/duel/utils'

export const initialState: DuelState = {
  activePlayerId: '',
  inactivePlayerId: '',
  phase: 'Intro Screen',
  players: {},
  cards: {},
  logs: [],
}

export const duelReducer = (
  state: Readonly<DuelState>,
  action: DuelAction,
): DuelState => {
  const { players, logs } = state

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

    case 'DRAW_INITIAL_CARDS': {
      const updatedPlayers = { ...state.players }

      // Draw initial cards for each player
      Object.keys(updatedPlayers).forEach((playerId) => {
        const player = updatedPlayers[playerId]
        const { updatedFrom, updatedTo } = drawCards(
          player.deck,
          player.hand,
          INITIAL_CARDS_DRAWN_AMOUNT,
        )

        updatedPlayers[playerId] = {
          ...player,
          deck: updatedFrom,
          hand: updatedTo,
        }
      })

      return {
        ...state,
        players: updatedPlayers,
      }
    }

    case 'PROGRESS_TO_REDRAW': {
      return {
        ...state,
        phase: 'Redrawing',
      }
    }

    case 'REDRAW_CARD': {
      const { playerId, cardId } = action

      const updatedPlayers = { ...players }
      const player = updatedPlayers[playerId]

      if (player) {
        updatedPlayers[playerId] = {
          ...player,
          hand: player.hand.filter((id) => id !== cardId),
          deck: [...player.deck, cardId],
        }
      }

      return {
        ...state,
        players: updatedPlayers,
        logs: [
          ...logs,
          formatString(messages.duel.logs.playerRedrawnCard, {
            playerName: players[playerId].name,
          }),
        ],
      }
    }

    case 'DRAW_A_CARD': {
      const { playerId } = action

      const updatedPlayers = { ...players }
      const player = updatedPlayers[playerId]

      if (player) {
        const { updatedFrom, updatedTo } = drawCards(player.deck, player.hand)

        updatedPlayers[playerId] = {
          ...player,
          deck: updatedFrom,
          hand: updatedTo,
        }
      }

      return {
        ...state,
        players: updatedPlayers,
      }
    }

    case 'READY_WITH_REDRAW': {
      const { playerId } = action

      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            hasPerformedAction: true,
          },
        },
      }
    }

    case 'SKIP_REDRAW': {
      const { playerId } = action

      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            hasPerformedAction: true,
          },
        },
        logs: [
          ...logs,
          formatString(messages.duel.logs.playerSkippedRedraw, {
            playerName: players[playerId].name,
          }),
        ],
      }
    }

    case 'BEGIN_FIRST_TURN': {
      return {
        ...state,
        phase: 'Player Turn',
        logs: [
          ...logs,
          formatString(messages.duel.firstPlayer, {
            playerName: players[state.activePlayerId].name,
          }),
        ],
      }
    }

    default:
      return state
  }
}
