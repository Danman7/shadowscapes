import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  INITIAL_CARDS_DRAWN,
  INITIAL_PLAYER_COINS,
  INITIAL_DUAL_STATE as initialState,
} from '../constants'
import type { CardInstance, DuelPlayer, DuelState } from '../types'
import { createCardInstance } from '../utils'
import { InitiateDuelPayload } from './duelStateTypes'

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
          deck,
          hand: [],
          board: [],
          discard: [],
          hasActedThisPhase: false,
        }
      })

      return {
        ...initialState,
        playerOrder: [users[0].id, users[1].id],
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
  },
})

export const { drawForPlayers, drawInitialHands, initiateDuelFromUsers } =
  duelSlice.actions

export const duelReducer = duelSlice.reducer
