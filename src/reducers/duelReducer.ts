import type { Duel, DuelAction } from '@/types'
import {
  INITIAL_CARDS_TO_DRAW,
  PLACEHOLDER_PLAYER,
} from '@/constants/duelParams'
import {
  createDuel,
  drawTopCard,
  getPlayer,
  updatePlayer,
} from '@/game-engine/initialization'
import { CARD_BASES } from '@/constants/cardBases'

export const initialDuelState: Readonly<Duel> = {
  cards: {},
  players: {
    player1: { ...PLACEHOLDER_PLAYER, id: 'player1' },
    player2: { ...PLACEHOLDER_PLAYER, id: 'player2' },
  },
  activePlayerId: 'player1',
  inactivePlayerId: 'player2',
  phase: 'intro',
  startingPlayerId: null,
}

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
        players: {
          player1: {
            ...state.players.player1,
            playerReady: false,
          },
          player2: {
            ...state.players.player2,
            playerReady: false,
          },
        },
      }
    }

    case 'SWITCH_TURN': {
      return {
        ...state,
        activePlayerId: state.inactivePlayerId,
        inactivePlayerId: state.activePlayerId,
        phase: 'player-turn',
      }
    }

    case 'DRAW_CARD': {
      const { playerId } = action.payload
      return drawTopCard(state, playerId)
    }

    case 'INITIAL_DRAW': {
      let stateClone = structuredClone(state)

      for (let i = 0; i < INITIAL_CARDS_TO_DRAW; i += 1) {
        stateClone = drawTopCard(stateClone, 'player1')
        stateClone = drawTopCard(stateClone, 'player2')
      }

      return {
        ...stateClone,
        phase: 'redraw',
      }
    }

    case 'PLAY_CARD': {
      const { playerId, cardInstanceId } = action.payload
      const player = getPlayer(state, playerId)
      const card = state.cards[cardInstanceId]

      if (!card) return state

      const { baseId, cost } = card

      const newhand = player.hand.filter(
        (id): id is number => id !== cardInstanceId,
      )

      const newPlayerCoins = player.coins - cost

      const updatedPlayer = {
        hand: newhand,
        coins: newPlayerCoins,
      }

      const { type } = CARD_BASES[baseId]

      let newState: Duel

      if (type === 'instant') {
        newState = updatePlayer(state, playerId, {
          ...updatedPlayer,
          discard: [...player.discard, cardInstanceId],
        })
      } else {
        newState = updatePlayer(state, playerId, {
          ...updatedPlayer,
          board: [...player.board, cardInstanceId],
        })
      }

      return {
        ...newState,
        phase: 'turn-end',
      }
    }

    case 'DISCARD_CARD': {
      const { playerId, cardInstanceId } = action.payload
      const player = getPlayer(state, playerId)

      const newhand = player.hand.filter(
        (id): id is number => id !== cardInstanceId,
      )

      return updatePlayer(state, playerId, {
        hand: newhand,
        discard: [...player.discard, cardInstanceId],
      })
    }

    case 'REDRAW_CARD': {
      const { playerId, cardInstanceId } = action.payload
      const player = getPlayer(state, playerId)

      const newhand = player.hand.filter(
        (id): id is number => id !== cardInstanceId,
      )
      const newdeck = [...player.deck, cardInstanceId]

      const stateWithCardAtBottom = updatePlayer(state, playerId, {
        hand: newhand,
        deck: newdeck,
        playerReady: true,
      })

      return drawTopCard(stateWithCardAtBottom, playerId)
    }

    case 'PLAYER_READY': {
      const { playerId } = action.payload

      return updatePlayer(state, playerId, {
        playerReady: true,
      })
    }

    case 'EXECUTE_ATTACKS': {
      const activePlayer = getPlayer(state, state.activePlayerId)
      const inactivePlayer = getPlayer(state, state.inactivePlayerId)

      const attackCount = activePlayer.board.length
      const newInactiveCoins = Math.max(0, inactivePlayer.coins - attackCount)

      const stateAfterAttacks = updatePlayer(state, state.inactivePlayerId, {
        coins: newInactiveCoins,
      })

      return {
        ...stateAfterAttacks,
        activePlayerId: stateAfterAttacks.inactivePlayerId,
        inactivePlayerId: stateAfterAttacks.activePlayerId,
        phase: 'player-turn',
      }
    }

    default:
      return state
  }
}
