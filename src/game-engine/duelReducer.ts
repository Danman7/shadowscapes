import { applyCardEffects } from 'src/game-engine/cardEffects'
import { INITIAL_CARDS_TO_DRAW } from 'src/game-engine/constants'
import {
  addLogEntry,
  createDuel,
  drawTopCard,
  getPendingInstant,
  resetCards,
  resetPlayers,
  updateCard,
  updatePlayers,
} from 'src/game-engine/helpers'
import type { Duel, DuelAction } from 'src/game-engine/types'
import { formatNoun } from 'src/utils'

export function duelReducer(
  state: Readonly<Duel>,
  action: DuelAction,
): Readonly<Duel> {
  switch (action.type) {
    case 'START_DUEL': {
      return createDuel(action.payload.players)
    }

    case 'START_INITIAL_DRAW': {
      let players = { ...state.players }

      for (let i = 0; i < INITIAL_CARDS_TO_DRAW; i += 1) {
        for (const playerId of state.playerOrder) {
          players = { ...players, [playerId]: drawTopCard(players[playerId]) }
        }
      }

      return {
        ...state,
        players,
        phase: 'initial-draw',
        logs: addLogEntry(
          state.logs,
          `Both players draw ${INITIAL_CARDS_TO_DRAW} cards.`,
        ),
      }
    }

    case 'GO_TO_REDRAW': {
      return {
        ...state,
        phase: 'redraw',
      }
    }

    case 'START_FIRST_PLAYER_TURN': {
      const activePlayerId = state.playerOrder[0]

      return {
        ...state,
        phase: 'player-turn',
        players: updatePlayers(
          resetPlayers(state.players),
          activePlayerId,
          drawTopCard,
        ),
        logs: addLogEntry(
          state.logs,
          `${state.players[activePlayerId].name} goes first.`,
        ),
      }
    }

    case 'GO_TO_END_OF_TURN': {
      return {
        ...state,
        phase: 'turn-end',
      }
    }

    case 'SWITCH_TURN': {
      const newActiveId = state.playerOrder[1]

      return {
        ...state,
        cards: resetCards(state.cards),
        playerOrder: [state.playerOrder[1], state.playerOrder[0]],
        phase: 'player-turn',
        players: updatePlayers(
          resetPlayers(state.players),
          newActiveId,
          drawTopCard,
        ),
        logs: addLogEntry(
          state.logs,
          `It's now ${state.players[newActiveId].name}'s turn so they draw a card.`,
        ),
      }
    }

    case 'PLAY_CARD': {
      const { playerId, cardInstanceId } = action.payload
      const player = state.players[playerId]
      const card = state.cards[cardInstanceId]

      const newHand = player.hand.filter((id) => id !== cardInstanceId)
      const newCoins = player.coins - card.attributes.cost
      const playLog = `${player.name} plays ${card.base.name} for ${formatNoun(card.attributes.cost)}. They have ${formatNoun(newCoins)} left.`

      const updatedState: Duel = {
        ...state,
        phase: 'turn-end',
        logs: addLogEntry(state.logs, playLog),
      }

      if (card.base.type === 'instant') {
        return {
          ...updatedState,
          pendingInstant: getPendingInstant(card, newHand, state),
          players: updatePlayers(state.players, playerId, (player) => ({
            ...player,
            hand: newHand,
            coins: newCoins,
            discard: [...player.discard, cardInstanceId],
          })),
        }
      }

      return {
        ...updatedState,
        players: updatePlayers(state.players, playerId, (player) => ({
          ...player,
          hand: newHand,
          coins: newCoins,
          board: [...player.board, cardInstanceId],
        })),
        cards: {
          ...state.cards,
          [cardInstanceId]: {
            ...card,
            attributes: {
              ...card.attributes,
              stunned: !card.attributes.haste,
            },
          },
        },
      }
    }

    case 'REDRAW_CARD': {
      const { playerId, cardInstanceId } = action.payload
      const player = state.players[playerId]

      return {
        ...state,
        players: updatePlayers(state.players, playerId, (player) =>
          drawTopCard({
            ...player,
            hand: player.hand.filter((id) => id !== cardInstanceId),
            deck: [...player.deck, cardInstanceId],
            playerReady: true,
          }),
        ),
        logs: addLogEntry(state.logs, `${player.name} redraws a card.`),
      }
    }

    case 'SKIP_REDRAW': {
      const { playerId } = action.payload
      const player = state.players[playerId]

      if (player.playerReady) return state

      return {
        ...state,
        players: {
          ...state.players,
          [playerId]: { ...player, playerReady: true },
        },
        logs: addLogEntry(state.logs, `${player.name} skips redraw.`),
      }
    }

    case 'ATTACK_CARD': {
      const { attackerId, defenderId } = action.payload
      const attacker = state.cards[attackerId]
      const defender = state.cards[defenderId]

      if (!attacker || !defender) return state
      if (
        attacker.attributes.strength === undefined ||
        defender.attributes.life === undefined
      )
        return state
      if (attacker.attributes.stunned) return state

      const defenderNewLife =
        defender.attributes.life - attacker.attributes.strength
      const defeated = defenderNewLife <= 0

      return {
        ...state,
        cards: updateCard(
          updateCard(state.cards, attackerId, (c) => ({ ...c, didAct: true })),
          defenderId,
          (c) => ({
            ...c,
            attributes: {
              ...c.attributes,
              life: defeated ? 0 : defenderNewLife,
            },
          }),
        ),
        players: defeated
          ? updatePlayers(state.players, state.playerOrder[1], (p) => ({
              ...p,
              board: p.board.filter((id) => id !== defenderId),
              discard: [...p.discard, defenderId],
            }))
          : state.players,
        logs: addLogEntry(
          state.logs,
          defeated
            ? `${attacker.base.name} attacks and defeats ${defender.base.name}.`
            : `${attacker.base.name} attacks ${defender.base.name}, dealing ${attacker.attributes.strength} damage. ${defender.base.name} has ${defenderNewLife} life left.`,
        ),
      }
    }

    case 'ATTACK_PLAYER': {
      const { attackerId } = action.payload
      const attacker = state.cards[attackerId]

      if (!attacker || attacker.attributes.stunned) return state

      const inactiveId = state.playerOrder[1]
      const inactivePlayer = state.players[inactiveId]
      const newCoins = Math.max(0, inactivePlayer.coins - 1)

      return {
        ...state,
        cards: updateCard(state.cards, attackerId, (c) => ({
          ...c,
          didAct: true,
        })),
        players: updatePlayers(state.players, inactiveId, (p) => ({
          ...p,
          coins: newCoins,
        })),
        logs: addLogEntry(
          state.logs,
          `${attacker.base.name} attacks ${inactivePlayer.name}. ${inactivePlayer.name} has ${formatNoun(newCoins)} left.`,
        ),
      }
    }

    case 'SET_PENDING_INSTANT': {
      return { ...state, pendingInstant: action.payload.pendingInstant }
    }

    case 'APPLY_SPEED_POTION': {
      const { targetCardInstanceId } = action.payload
      const card = state.cards[targetCardInstanceId]

      if (!card) return state

      return {
        ...state,
        pendingInstant: null,
        cards: {
          ...state.cards,
          [targetCardInstanceId]: {
            ...card,
            attributes: { ...card.attributes, haste: true },
          },
        },
        logs: addLogEntry(state.logs, `${card.base.name} gains haste.`),
      }
    }

    case 'APPLY_FLASH_BOMB': {
      const { targetCardInstanceId } = action.payload
      const card = state.cards[targetCardInstanceId]

      if (!card) return state

      return {
        ...state,
        pendingInstant: null,
        cards: {
          ...state.cards,
          [targetCardInstanceId]: {
            ...card,
            attributes: { ...card.attributes, stunned: true },
            didAct: true,
          },
        },
        logs: addLogEntry(
          state.logs,
          `${card.base.name} is stunned by a flash bomb.`,
        ),
      }
    }

    default:
      return state
  }
}

export function duelReducerWithEffects(
  state: Readonly<Duel>,
  action: DuelAction,
): Readonly<Duel> {
  const newState = duelReducer(state, action)

  return applyCardEffects(newState, action, state)
}
