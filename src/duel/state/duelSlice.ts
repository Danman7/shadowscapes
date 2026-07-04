import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getCardBase } from '../../cards'
import {
  INITIAL_CARDS_DRAWN,
  INITIAL_PLAYER_COINS,
  INITIAL_DUAL_STATE as initialState,
} from '../constants'
import type { CardInstance, DuelPlayer, DuelState } from '../types'
import {
  canActivePlayerPass,
  canActivePlayTurnComplete,
  canCardBePlayed,
  createCardInstance,
  haveBothPlayersActed,
  isPendingPlayedCardAnInstance,
  shuffle,
} from '../utils'
import type { InitiateDuelPayload, PlayCardPayload } from './duelStateTypes'

const drawCards = (
  state: DuelState,
  playerId: string,
  amount: number,
) => {
  const player = state.players[playerId]
  const drawnCardIds = player.deck.splice(0, amount)

  drawnCardIds.forEach((cardId) => {
    state.cards[cardId].stack = 'hand'
  })
  player.hand.push(...drawnCardIds)
}

export const duelSlice = createSlice({
  name: 'duel',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    initiateDuelFromUsers: (
      _state,
      action: PayloadAction<InitiateDuelPayload>,
    ): DuelState => {
      const users = action.payload
      const players: Record<string, DuelPlayer> = {}
      const cards: Record<string, CardInstance> = {}
      const playerOrder: DuelState['playerOrder'] =
        Math.random() < 0.5
          ? [users[0].id, users[1].id]
          : [users[1].id, users[0].id]

      users.forEach((user) => {
        const deck = user.activeDeck.map((baseId) => {
          const card = createCardInstance(baseId, user.id, 'deck')

          cards[card.id] = card

          return card.id
        })

        players[user.id] = {
          id: user.id,
          name: user.name,
          coins: INITIAL_PLAYER_COINS,
          income: 0,
          deck: shuffle(deck),
          hand: [],
          board: [],
          discard: [],
          hasActedThisPhase: false,
        }
      })

      return {
        ...initialState,
        playerOrder,
        players,
        cards,
      }
    },
    drawInitialHands: (state) => {
      if (
        state.phase !== 'setup' ||
        !state.playerOrder.every(
          (playerId) =>
            state.players[playerId].hand.length < INITIAL_CARDS_DRAWN,
        )
      ) {
        return
      }

      state.playerOrder.forEach((playerId) => {
        const cardsNeeded =
          INITIAL_CARDS_DRAWN - state.players[playerId].hand.length

        drawCards(state, playerId, cardsNeeded)
      })
      state.phase = 'draw'
    },
    drawForPlayers: (state) => {
      if (state.phase !== 'draw') return

      state.playerOrder.forEach((playerId) => {
        drawCards(state, playerId, 1)
      })
      state.phase = 'play'
    },
    playCard: (state, action: PayloadAction<PlayCardPayload>) => {
      if (!canCardBePlayed({ state, ...action.payload })) return

      const { playerId, cardInstanceId, cardBaseId } = action.payload
      const player = state.players[playerId]
      const card = state.cards[cardInstanceId]
      const cardIndex = player.hand.indexOf(cardInstanceId)

      player.coins -= getCardBase(cardBaseId).cost
      player.hand.splice(cardIndex, 1)
      player.board.push(cardInstanceId)
      player.hasActedThisPhase = true
      card.stack = 'board'
      state.pendingPlayedCardId = cardInstanceId
    },
    passPlayTurn: (state) => {
      if (!canActivePlayerPass(state)) return

      const activePlayer = state.players[state.playerOrder[0]]

      activePlayer.hasActedThisPhase = true
    },
    completePlayTurn: (state) => {
      if (!canActivePlayTurnComplete(state)) return

      const activePlayer = state.players[state.playerOrder[0]]
      const pendingCardId = state.pendingPlayedCardId

      if (pendingCardId && isPendingPlayedCardAnInstance(state, activePlayer.id)) {
        const pendingCard = state.cards[pendingCardId]
        const cardIndex = activePlayer.board.indexOf(pendingCardId)

        if (cardIndex !== -1) {
          activePlayer.board.splice(cardIndex, 1)
          activePlayer.discard.push(pendingCardId)
          pendingCard.stack = 'discard'
        }
      }

      state.pendingPlayedCardId = null

      const bothPlayersActed = haveBothPlayersActed(state)

      state.playerOrder = [state.playerOrder[1], state.playerOrder[0]]

      if (bothPlayersActed) {
        state.phase = 'act'
        state.playerOrder.forEach((playerId) => {
          state.players[playerId].hasActedThisPhase = false
        })
      }
    },
  },
})

export const {
  completePlayTurn,
  drawForPlayers,
  drawInitialHands,
  initiateDuelFromUsers,
  passPlayTurn,
  playCard,
} = duelSlice.actions

export const duelReducer = duelSlice.reducer
