import type { Duel, DuelAction } from '@/types'
import {
  createDuel,
  createInitialDuel,
  getPlayer,
  updatePlayer,
} from '@/game-engine/initialization'

/**
 * Initial duel state (placeholder duel, not yet started)
 */
export const initialDuelState: Readonly<Duel> = createInitialDuel()

/**
 * Game reducer that manages all duel state transitions
 */
export function duelReducer(
  state: Readonly<Duel>,
  action: DuelAction,
): Readonly<Duel> {
  switch (action.type) {
    case 'START_DUEL': {
      const { player1Name, player1Deck, player2Name, player2Deck } =
        action.payload

      return createDuel({
        player1Name,
        player2Name,
        player1Deck,
        player2Deck,
      })
    }

    case 'TRANSITION_PHASE': {
      return {
        ...state,
        phase: action.payload,
      }
    }

    case 'SWITCH_TURN': {
      return {
        ...state,
        activePlayerId: state.inactivePlayerId,
        inactivePlayerId: state.activePlayerId,
      }
    }

    case 'DRAW_CARD': {
      const { playerId } = action.payload
      const player = getPlayer(state, playerId)

      if (player.deckIds.length === 0) {
        return state
      }

      const [drawnCardId, ...remainingDeckIds] = player.deckIds

      if (drawnCardId) {
        const newHandIds = [...player.handIds, drawnCardId]

        return updatePlayer(state, playerId, {
          deckIds: remainingDeckIds,
          handIds: newHandIds,
        })
      } else {
        return state
      }
    }

    case 'PLAY_CARD': {
      const { playerId, cardInstanceId } = action.payload
      const player = getPlayer(state, playerId)
      const card = state.cards[cardInstanceId]

      if (!card) {
        return state
      }

      const newHandIds = player.handIds.filter(
        (id): id is number => id !== cardInstanceId,
      )

      if (card.type === 'instant') {
        return updatePlayer(state, playerId, {
          handIds: newHandIds,
          discardIds: [...player.discardIds, cardInstanceId],
        })
      } else {
        return updatePlayer(state, playerId, {
          handIds: newHandIds,
          boardIds: [...player.boardIds, cardInstanceId],
        })
      }
    }

    case 'DISCARD_CARD': {
      const { playerId, cardInstanceId } = action.payload
      const player = getPlayer(state, playerId)

      const newHandIds = player.handIds.filter(
        (id): id is number => id !== cardInstanceId,
      )

      return updatePlayer(state, playerId, {
        handIds: newHandIds,
        discardIds: [...player.discardIds, cardInstanceId],
      })
    }

    default:
      return state
  }
}
