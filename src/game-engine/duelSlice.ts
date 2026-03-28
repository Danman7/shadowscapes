import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { INITIAL_CARDS_TO_DRAW } from 'src/game-engine/constants'
import { createDuel, getPendingInstant } from 'src/game-engine/helpers'
import type {
  Duel,
  PendingInstant,
  PlayerId,
  PlayerSetup,
} from 'src/game-engine/types'
import { formatString, messages } from 'src/i18n'

const initialState: Duel = {
  cards: {},
  players: {},
  playerOrder: ['', ''],
  phase: 'intro',
  logs: [],
  pendingInstant: null,
}

const duelSlice = createSlice({
  name: 'duel',
  initialState,
  reducers: {
    startDuel(
      _state,
      action: PayloadAction<{ players: [PlayerSetup, PlayerSetup] }>,
    ) {
      return createDuel(action.payload.players)
    },

    startInitialDraw(state) {
      for (let i = 0; i < INITIAL_CARDS_TO_DRAW; i += 1) {
        for (const playerId of state.playerOrder) {
          const player = state.players[playerId]
          const cardId = player.deck.shift()
          if (cardId) player.hand.push(cardId)
        }
      }

      state.phase = 'initial-draw'
      state.logs.push(
        formatString(messages.reducer.bothPlayersDraw, {
          count: INITIAL_CARDS_TO_DRAW,
        }),
      )
    },

    goToRedraw(state) {
      state.phase = 'redraw'
    },

    startFirstPlayerTurn(state) {
      const activePlayerId = state.playerOrder[0]

      for (const player of Object.values(state.players)) {
        player.playerReady = false
      }

      const activePlayer = state.players[activePlayerId]
      const cardId = activePlayer.deck.shift()
      if (cardId) activePlayer.hand.push(cardId)

      state.phase = 'player-turn'
      state.logs.push(
        formatString(messages.reducer.goesFirst, {
          playerName: state.players[activePlayerId].name,
        }),
      )
    },

    goToEndOfTurn(state) {
      state.phase = 'turn-end'
    },

    switchTurn(state) {
      const newActiveId = state.playerOrder[1]

      for (const card of Object.values(state.cards)) {
        card.didAct = false
        card.attributes.stunned = false
      }

      state.playerOrder = [state.playerOrder[1], state.playerOrder[0]]
      state.phase = 'player-turn'

      for (const player of Object.values(state.players)) {
        player.playerReady = false
      }

      const newActivePlayer = state.players[newActiveId]
      const cardId = newActivePlayer.deck.shift()
      if (cardId) newActivePlayer.hand.push(cardId)

      state.logs.push(
        formatString(messages.reducer.switchTurn, {
          playerName: state.players[newActiveId].name,
        }),
      )
    },

    playCard(
      state,
      action: PayloadAction<{ playerId: PlayerId; cardInstanceId: string }>,
    ) {
      const { playerId, cardInstanceId } = action.payload
      const player = state.players[playerId]
      const card = state.cards[cardInstanceId]

      player.hand = player.hand.filter((id) => id !== cardInstanceId)
      player.coins -= card.attributes.cost

      state.phase = 'turn-end'
      state.logs.push(
        formatString(messages.reducer.playCard, {
          playerName: player.name,
          cardName: card.base.name,
        }),
      )

      if (card.base.type === 'instant') {
        state.pendingInstant = getPendingInstant(card, player.hand, state)
        player.discard.push(cardInstanceId)
        return
      }

      player.board.push(cardInstanceId)
      card.attributes.stunned = !card.attributes.haste
    },

    redrawCard(
      state,
      action: PayloadAction<{ playerId: PlayerId; cardInstanceId: string }>,
    ) {
      const { playerId, cardInstanceId } = action.payload
      const player = state.players[playerId]

      player.hand = player.hand.filter((id) => id !== cardInstanceId)
      player.deck.push(cardInstanceId)
      player.playerReady = true

      const cardId = player.deck.shift()
      if (cardId) player.hand.push(cardId)

      state.logs.push(
        formatString(messages.reducer.redrawCard, {
          playerName: player.name,
        }),
      )
    },

    skipRedraw(state, action: PayloadAction<{ playerId: PlayerId }>) {
      const { playerId } = action.payload
      const player = state.players[playerId]

      if (player.playerReady) return

      player.playerReady = true
      state.logs.push(
        formatString(messages.reducer.skipRedraw, {
          playerName: player.name,
        }),
      )
    },

    attackCard(
      state,
      action: PayloadAction<{ attackerId: string; defenderId: string }>,
    ) {
      const { attackerId, defenderId } = action.payload
      const attacker = state.cards[attackerId]
      const defender = state.cards[defenderId]

      if (!attacker || !defender) return
      if (
        attacker.attributes.strength === undefined ||
        defender.attributes.life === undefined
      )
        return
      if (attacker.attributes.stunned) return

      attacker.didAct = true

      const defenderNewLife =
        defender.attributes.life - attacker.attributes.strength
      const defeated = defenderNewLife <= 0

      defender.attributes.life = defeated ? 0 : defenderNewLife

      if (defeated) {
        const inactivePlayer = state.players[state.playerOrder[1]]
        inactivePlayer.board = inactivePlayer.board.filter(
          (id) => id !== defenderId,
        )
        inactivePlayer.discard.push(defenderId)
      }

      state.logs.push(
        defeated
          ? formatString(messages.reducer.attackCardDefeated, {
              attackerName: attacker.base.name,
              defenderName: defender.base.name,
            })
          : formatString(messages.reducer.attackCardDamage, {
              attackerName: attacker.base.name,
              defenderName: defender.base.name,
              damage: attacker.attributes.strength,
            }),
      )
    },

    attackPlayer(state, action: PayloadAction<{ attackerId: string }>) {
      const { attackerId } = action.payload
      const attacker = state.cards[attackerId]

      if (!attacker || attacker.attributes.stunned) return

      attacker.didAct = true

      const inactiveId = state.playerOrder[1]
      const inactivePlayer = state.players[inactiveId]
      inactivePlayer.coins = Math.max(0, inactivePlayer.coins - 1)

      state.logs.push(
        formatString(messages.reducer.attackPlayer, {
          attackerName: attacker.base.name,
          playerName: inactivePlayer.name,
          coins: inactivePlayer.coins,
        }),
      )
    },

    setPendingInstant(
      state,
      action: PayloadAction<{ pendingInstant: PendingInstant | null }>,
    ) {
      state.pendingInstant = action.payload.pendingInstant
    },

    applySpeedPotion(
      state,
      action: PayloadAction<{ targetCardInstanceId: string }>,
    ) {
      const { targetCardInstanceId } = action.payload
      const card = state.cards[targetCardInstanceId]

      if (!card) return

      state.pendingInstant = null
      card.attributes.haste = true

      state.logs.push(
        formatString(messages.reducer.gainsHaste, {
          cardName: card.base.name,
        }),
      )
    },

    applyFlashBomb(
      state,
      action: PayloadAction<{ targetCardInstanceId: string }>,
    ) {
      const { targetCardInstanceId } = action.payload
      const card = state.cards[targetCardInstanceId]

      if (!card) return

      state.pendingInstant = null
      card.attributes.stunned = true
      card.didAct = true

      state.logs.push(
        formatString(messages.reducer.stunned, {
          cardName: card.base.name,
        }),
      )
    },

    _applyEffects(_state, action: PayloadAction<Duel>) {
      return action.payload
    },
  },
})

export const {
  startDuel,
  startInitialDraw,
  goToRedraw,
  startFirstPlayerTurn,
  goToEndOfTurn,
  switchTurn,
  playCard,
  redrawCard,
  skipRedraw,
  attackCard,
  attackPlayer,
  setPendingInstant,
  applySpeedPotion,
  applyFlashBomb,
  _applyEffects,
} = duelSlice.actions

export const duelReducer = duelSlice.reducer
export default duelSlice
