import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit'

import { INITIAL_CARDS_TO_DRAW } from 'src/game-engine/constants'
import { createDuel } from 'src/game-engine/cards'
import type { Duel, PlayerSetup } from 'src/game-engine/types'
import { drawCards, resetPlayersReady } from 'src/game-engine/utils'
import { formatString, messages } from 'src/i18n'

export const startDuel: CaseReducer<
  Duel,
  PayloadAction<{ players: [PlayerSetup, PlayerSetup] }>
> = (_state, action) => createDuel(action.payload.players)

export const startInitialDraw: CaseReducer<Duel> = (state) => {
  for (const playerId of state.playerOrder) {
    drawCards(state.players[playerId], INITIAL_CARDS_TO_DRAW)
  }

  state.phase = 'initial-draw'
  state.logs.push(
    formatString(messages.reducer.bothPlayersDraw, {
      count: INITIAL_CARDS_TO_DRAW,
    }),
  )
}

export const goToRedraw: CaseReducer<Duel> = (state) => {
  state.phase = 'redraw'
}

export const startFirstPlayerTurn: CaseReducer<Duel> = (state) => {
  resetPlayersReady(state)

  const { playerOrder, players } = state

  const activePlayerId = playerOrder[0]
  const activePlayer = players[activePlayerId]

  drawCards(activePlayer)

  state.phase = 'player-turn'
  state.logs.push(
    formatString(messages.reducer.goesFirst, {
      playerName: activePlayer.name,
    }),
  )
}

export const goToEndOfTurn: CaseReducer<Duel> = (state) => {
  state.phase = 'turn-end'
}

export const switchTurn: CaseReducer<Duel> = (state) => {
  for (const card of Object.values(state.cards)) {
    card.didAct = false
    card.attributes.isStunned = false
  }

  state.playerOrder = [state.playerOrder[1], state.playerOrder[0]]
  state.phase = 'player-turn'

  resetPlayersReady(state)

  const newActiveId = state.playerOrder[0]
  const newActivePlayer = state.players[newActiveId]
  drawCards(newActivePlayer)

  state.logs.push(
    formatString(messages.reducer.switchTurn, {
      playerName: newActivePlayer.name,
    }),
  )
}
