import type { CardInstance, Duel, DuelAction } from '@/types'
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
      const resetCards: Record<number, CardInstance> = {}

      for (const [id, card] of Object.entries(state.cards)) {
        resetCards[Number(id)] = {
          ...card,
          didAct: false,
        }
      }

      return {
        ...state,
        cards: resetCards,
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

    case 'ATTACK_CARD': {
      const { attackerId, defenderId } = action.payload
      const attacker = state.cards[attackerId]
      const defender = state.cards[defenderId]

      if (!attacker || !defender) return state
      if (attacker.strength === undefined || defender.strength === undefined)
        return state

      const activePlayer = getPlayer(state, state.activePlayerId)
      const inactivePlayer = getPlayer(state, state.inactivePlayerId)

      let newState = { ...state }
      const newCards = { ...state.cards }

      newCards[attackerId] = {
        ...attacker,
        didAct: true,
      }

      const defenderNewStrength = defender.strength - attacker.strength

      if (defenderNewStrength <= 0) {
        newCards[defenderId] = {
          ...defender,
          strength: 0,
        }

        newState = updatePlayer(newState, state.inactivePlayerId, {
          board: inactivePlayer.board.filter((id) => id !== defenderId),
          discard: [...inactivePlayer.discard, defenderId],
        })
      } else {
        newCards[defenderId] = {
          ...defender,
          strength: defenderNewStrength,
        }

        const attackerNewStrength = attacker.strength - defenderNewStrength

        if (attackerNewStrength <= 0) {
          newCards[attackerId] = {
            ...newCards[attackerId]!,
            strength: 0,
          }

          newState = updatePlayer(newState, state.activePlayerId, {
            board: activePlayer.board.filter((id) => id !== attackerId),
            discard: [...activePlayer.discard, attackerId],
          })
        } else {
          newCards[attackerId] = {
            ...newCards[attackerId]!,
            strength: attackerNewStrength,
          }
        }
      }

      return {
        ...newState,
        cards: newCards,
      }
    }

    case 'ATTACK_PLAYER': {
      const { attackerId } = action.payload
      const attacker = state.cards[attackerId]

      if (!attacker) return state

      const inactivePlayer = getPlayer(state, state.inactivePlayerId)
      const newInactiveCoins = Math.max(0, inactivePlayer.coins - 1)

      const newCards = {
        ...state.cards,
        [attackerId]: {
          ...attacker,
          didAct: true,
        },
      }

      return {
        ...updatePlayer(state, state.inactivePlayerId, {
          coins: newInactiveCoins,
        }),
        cards: newCards,
      }
    }

    default:
      return state
  }
}
