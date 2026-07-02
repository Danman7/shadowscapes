import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  INITIAL_PLAYER_COINS,
  INITIAL_DUAL_STATE as initialState,
} from '../constants'
import type { CardInstance, DuelPlayer, DuelState } from '../types'
import { createCardInstance } from '../utils'
import { InitiateDuelPayload } from './duelStateTypes'

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
  },
})

export const { initiateDuelFromUsers } = duelSlice.actions

export const duelReducer = duelSlice.reducer
