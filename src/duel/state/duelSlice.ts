import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  INCOME_PER_TURN,
  INITIAL_CARDS_DRAWN,
  INITIAL_PLAYER_COINS,
  INITIAL_DUAL_STATE as initialState,
} from '../constants'
import type {
  CardInstance,
  CharacterCardInstance,
  DuelPlayer,
  DuelState,
} from '../types'
import {
  canActPlayerPass,
  canActTurnComplete,
  canCardBePlayed,
  canCharacterAttack,
  createCardInstance,
  haveBothPlayersActed,
  isCharacterInstance,
  moveCard,
  reduceTurnsStunned,
  shuffle,
} from '../utils'
import type {
  AttackCharacterPayload,
  InitiateDuelPayload,
  PlayCardPayload,
} from './duelStateTypes'

const decrementPlayerCharactersStun = (state: DuelState, playerId: string) => {
  const player = state.players[playerId]

  player.board.forEach((cardId) => {
    const card = state.cards[cardId]

    if (isCharacterInstance(card)) reduceTurnsStunned(card)
  })
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
        actPlayerId: null,
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

        moveCard({
          state,
          playerId,
          from: 'deck',
          to: 'hand',
          amount: cardsNeeded,
        })
      })
      state.phase = 'draw'
    },
    drawForPlayers: (state) => {
      if (state.phase !== 'draw') return

      state.playerOrder.forEach((playerId) => {
        moveCard({ state, playerId, from: 'deck', to: 'hand' })
      })
      decrementPlayerCharactersStun(state, state.playerOrder[0])
      state.phase = 'play'
    },
    playCard: (state, action: PayloadAction<PlayCardPayload>) => {
      if (!canCardBePlayed({ state, ...action.payload })) return

      const { playerId, cardInstanceId } = action.payload
      const player = state.players[playerId]
      const card = state.cards[cardInstanceId]

      player.coins -= card.cost
      moveCard({
        state,
        playerId,
        cardId: cardInstanceId,
        from: 'hand',
        to: 'board',
      })
      player.hasActedThisPhase = true
      state.pendingPlayedCardId = cardInstanceId
    },
    passPlayTurn: (state) => {
      const activePlayer = state.players[state.playerOrder[0]]

      activePlayer.hasActedThisPhase = true
    },
    completePlayTurn: (state) => {
      const activePlayer = state.players[state.playerOrder[0]]
      const pendingCardId = state.pendingPlayedCardId

      if (pendingCardId && state.cards[pendingCardId].type === 'instance') {
        moveCard({
          state,
          playerId: activePlayer.id,
          cardId: pendingCardId,
          from: 'board',
          to: 'discard',
        })
      }

      state.pendingPlayedCardId = null

      const bothPlayersActed = haveBothPlayersActed(state)

      state.playerOrder = [state.playerOrder[1], state.playerOrder[0]]

      if (bothPlayersActed) {
        state.phase = 'act'
        state.actPlayerId = state.playerOrder[0]
        state.playerOrder.forEach((playerId) => {
          state.players[playerId].hasActedThisPhase = false
        })
      } else {
        decrementPlayerCharactersStun(state, state.playerOrder[0])
      }
    },
    attackCharacter: (state, action: PayloadAction<AttackCharacterPayload>) => {
      if (!canCharacterAttack(state, action.payload)) return

      const attacker = state.cards[
        action.payload.attackerId
      ] as CharacterCardInstance
      const defender = state.cards[
        action.payload.defenderId
      ] as CharacterCardInstance

      attacker.didAct = true
      defender.life -= attacker.strength

      if (defender.life <= 0) {
        moveCard({
          state,
          playerId: defender.ownerId,
          cardId: defender.id,
          from: 'board',
          to: 'discard',
        })
      }
    },
    passActTurn: (state) => {
      if (!state.actPlayerId || !canActPlayerPass(state)) return

      state.players[state.actPlayerId].hasActedThisPhase = true
    },
    completeActTurn: (state) => {
      if (!state.actPlayerId || !canActTurnComplete(state)) return

      const completingPlayerId = state.actPlayerId
      state.players[completingPlayerId].hasActedThisPhase = true

      const nextPlayerId = state.playerOrder.find(
        (playerId) => !state.players[playerId].hasActedThisPhase,
      )

      if (nextPlayerId) {
        state.playerOrder = [nextPlayerId, completingPlayerId]
        state.actPlayerId = nextPlayerId
        return
      }

      state.actPlayerId = null
      state.phase = 'refresh'
    },
    completeRefresh: (state) => {
      if (state.phase !== 'refresh') return

      state.round += 1

      state.playerOrder.forEach((playerId) => {
        const player = state.players[playerId]

        player.hasActedThisPhase = false
        if (player.income > 0) player.coins += INCOME_PER_TURN

        player.board.forEach((cardId) => {
          const card = state.cards[cardId]

          if (card.type === 'character') card.didAct = false
        })
      })

      state.phase = 'draw'
    },
  },
})

export const {
  attackCharacter,
  completeActTurn,
  completePlayTurn,
  completeRefresh,
  drawForPlayers,
  drawInitialHands,
  initiateDuelFromUsers,
  passActTurn,
  passPlayTurn,
  playCard,
} = duelSlice.actions

export const duelReducer = duelSlice.reducer
