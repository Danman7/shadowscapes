import { CARD_BASES } from '@/constants/cardBases'
import {
  INITIAL_CARDS_TO_DRAW,
  PLACEHOLDER_PLAYER,
} from '@/constants/duelParams'
import { applyCardEffects } from '@/game-engine/cardEffects'
import {
  createDuel,
  drawTopCard,
  getPlayer,
  updatePlayer,
} from '@/game-engine/initialization'
import { formatNoun } from '@/game-engine/utils'
import type { CardInstance, Duel, DuelAction, PendingInstant } from '@/types'

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
  logs: [],
  pendingInstant: null,
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
      const transitionedState: Duel = {
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

      if (state.phase === 'redraw' && action.payload === 'player-turn') {
        return drawTopCard(transitionedState, state.activePlayerId)
      }

      return transitionedState
    }

    case 'SWITCH_TURN': {
      const resetCards: Record<number, CardInstance> = {}

      for (const [id, card] of Object.entries(state.cards)) {
        const turnsLeft = card.stunnedTurnsRemaining ?? 0
        const newTurnsLeft = turnsLeft > 0 ? turnsLeft - 1 : 0

        resetCards[Number(id)] = {
          ...card,
          didAct: false,
          stunned: newTurnsLeft > 0,
          stunnedTurnsRemaining: newTurnsLeft > 0 ? newTurnsLeft : undefined,
        }
      }

      const switchedState: Duel = {
        ...state,
        cards: resetCards,
        activePlayerId: state.inactivePlayerId,
        inactivePlayerId: state.activePlayerId,
        phase: 'player-turn',
      }

      const newActivePlayer = getPlayer(
        switchedState,
        switchedState.activePlayerId,
      )
      const stateAfterDraw = drawTopCard(
        switchedState,
        switchedState.activePlayerId,
      )
      const newActivePlayerAfterDraw = getPlayer(
        stateAfterDraw,
        stateAfterDraw.activePlayerId,
      )

      return {
        ...stateAfterDraw,
        logs: [
          ...state.logs,
          `It's now ${newActivePlayer.name}'s turn so they draw a card. They have ${formatNoun(
            newActivePlayerAfterDraw.hand.length,
            'card',
          )} in hand and ${formatNoun(
            newActivePlayerAfterDraw.deck.length,
            'card',
          )} left in deck.`,
        ],
      }
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
        logs: [
          ...state.logs,
          `Both players draw ${INITIAL_CARDS_TO_DRAW} cards.`,
        ],
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

      const playLog = `${player.name} plays ${CARD_BASES[baseId].name} for ${formatNoun(cost)}. They have ${formatNoun(newPlayerCoins)} left.`

      if (type === 'instant') {
        newState = updatePlayer(state, playerId, {
          ...updatedPlayer,
          discard: [...player.discard, cardInstanceId],
        })

        let pendingInstant: PendingInstant | null = null

        if (baseId === 'speedPotion') {
          const hasHandCharacters = newhand.some(
            (id) => CARD_BASES[state.cards[id]!.baseId].type === 'character',
          )
          if (hasHandCharacters) pendingInstant = { type: 'SPEED_POTION' }
        } else if (baseId === 'flashBomb') {
          const totalBoardCards =
            state.players.player1.board.length +
            state.players.player2.board.length
          if (totalBoardCards > 0) pendingInstant = { type: 'FLASH_BOMB' }
        }

        return {
          ...newState,
          pendingInstant,
          phase: 'turn-end',
          logs: [...state.logs, playLog],
        }
      } else {
        newState = updatePlayer(state, playerId, {
          ...updatedPlayer,
          board: [...player.board, cardInstanceId],
        })
        newState = {
          ...newState,
          cards: {
            ...newState.cards,
            [cardInstanceId]: {
              ...newState.cards[cardInstanceId]!,
              stunned: !card.haste,
            },
          },
        }
      }

      return {
        ...newState,
        phase: 'turn-end',
        logs: [...state.logs, playLog],
      }
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

      return {
        ...drawTopCard(stateWithCardAtBottom, playerId),
        logs: [...state.logs, `${player.name} redraws a card.`],
      }
    }

    case 'SKIP_REDRAW': {
      const { playerId } = action.payload
      const player = getPlayer(state, playerId)

      if (player.playerReady) return state

      return {
        ...updatePlayer(state, playerId, {
          playerReady: true,
        }),
        logs: [...state.logs, `${player.name} skips redraw.`],
      }
    }

    case 'ATTACK_CARD': {
      const { attackerId, defenderId } = action.payload
      const attacker = state.cards[attackerId]
      const defender = state.cards[defenderId]

      if (!attacker || !defender) return state
      if (attacker.strength === undefined || defender.life === undefined)
        return state
      if (attacker.stunned) return state

      const inactivePlayer = getPlayer(state, state.inactivePlayerId)

      let newState = { ...state }
      let attackLog: string
      const newCards = { ...state.cards }

      newCards[attackerId] = {
        ...attacker,
        didAct: true,
      }

      const defenderNewLife = defender.life - attacker.strength

      if (defenderNewLife <= 0) {
        newCards[defenderId] = {
          ...defender,
          life: 0,
        }

        newState = updatePlayer(newState, state.inactivePlayerId, {
          board: inactivePlayer.board.filter((id) => id !== defenderId),
          discard: [...inactivePlayer.discard, defenderId],
        })

        attackLog = `${CARD_BASES[attacker.baseId].name} attacks and defeats ${CARD_BASES[defender.baseId].name}.`
      } else {
        newCards[defenderId] = {
          ...defender,
          life: defenderNewLife,
        }

        attackLog = `${CARD_BASES[attacker.baseId].name} attacks ${CARD_BASES[defender.baseId].name}, dealing ${attacker.strength} damage. ${CARD_BASES[defender.baseId].name} has ${defenderNewLife} life left.`
      }

      return {
        ...newState,
        cards: newCards,
        logs: [...state.logs, attackLog],
      }
    }

    case 'ATTACK_PLAYER': {
      const { attackerId } = action.payload
      const attacker = state.cards[attackerId]

      if (!attacker) return state
      if (attacker.stunned) return state

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
        logs: [
          ...state.logs,
          `${CARD_BASES[attacker.baseId].name} attacks ${inactivePlayer.name}. ${inactivePlayer.name} has ${formatNoun(
            newInactiveCoins,
          )} left.`,
        ],
      }
    }

    case 'SET_PENDING_INSTANT': {
      return { ...state, pendingInstant: action.payload }
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
          [targetCardInstanceId]: { ...card, haste: true },
        },
        logs: [...state.logs, `${CARD_BASES[card.baseId].name} gains haste.`],
      }
    }

    case 'APPLY_FLASH_BOMB': {
      const { targetCardInstanceId } = action.payload
      const card = state.cards[targetCardInstanceId]

      if (!card) return state

      const targetIsActive =
        state.players[state.activePlayerId].board.includes(targetCardInstanceId)
      const stunnedTurnsRemaining = targetIsActive ? 3 : 2

      return {
        ...state,
        pendingInstant: null,
        cards: {
          ...state.cards,
          [targetCardInstanceId]: {
            ...card,
            stunned: true,
            stunnedTurnsRemaining,
            didAct: true,
          },
        },
        logs: [
          ...state.logs,
          `${CARD_BASES[card.baseId].name} is stunned by a flash bomb.`,
        ],
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
