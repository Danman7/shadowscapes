import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit'

import {
  PLAYER_1_INITIAL_HAND,
  PLAYER_2_INITIAL_HAND,
  PLAYER_2_SKIP_FIRST_DRAW,
} from 'src/game-engine/constants'
import { createDuel } from 'src/game-engine/cards'
import type { Duel, PlayerSetup } from 'src/game-engine/types'
import { drawCards, resetPlayersReady } from 'src/game-engine/utils'
import { formatString, messages } from 'src/i18n'

export const startDuel: CaseReducer<
  Duel,
  PayloadAction<{ players: [PlayerSetup, PlayerSetup] }>
> = (_state, action) => createDuel(action.payload.players)

export const startInitialDraw: CaseReducer<Duel> = (state) => {
  const firstPlayerId = state.playerOrder[0]
  const secondPlayerId = state.playerOrder[1]

  drawCards(state.players[firstPlayerId], PLAYER_1_INITIAL_HAND)
  drawCards(state.players[secondPlayerId], PLAYER_2_INITIAL_HAND)

  state.phase = 'initial-draw'
  state.logs.push(
    formatString(messages.reducer.bothPlayersDraw, {
      count: PLAYER_1_INITIAL_HAND,
    }),
  )
}

export const goToRedraw: CaseReducer<Duel> = (state) => {
  state.phase = 'redraw'
  state.pendingCharacterAbility = null
}

export const startFirstPlayerTurn: CaseReducer<Duel> = (state) => {
  resetPlayersReady(state)
  state.pendingCharacterAbility = null

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
  state.pendingCharacterAbility = null
}

export const switchTurn: CaseReducer<Duel> = (state) => {
  const previousActiveId = state.playerOrder[0]
  const previousInactiveId = state.playerOrder[1]

  for (const card of Object.values(state.cards)) {
    card.didAct = false
  }

  state.playerOrder = [previousInactiveId, previousActiveId]
  state.phase = 'player-turn'
  state.pendingCharacterAbility = null

  resetPlayersReady(state)

  const newActiveId = state.playerOrder[0]
  const newActivePlayer = state.players[newActiveId]

  for (const cardId of newActivePlayer.board) {
    const card = state.cards[cardId]
    if (!card) continue

    if (card.attributes.isStunned !== true) continue

    const stunnedTurnsRemaining = card.attributes.stunnedTurnsRemaining ?? 0

    if (stunnedTurnsRemaining > 0) {
      card.attributes.stunnedTurnsRemaining = stunnedTurnsRemaining - 1
      continue
    }

    card.attributes.isStunned = false
    card.attributes.stunnedTurnsRemaining = undefined
  }

  const isSecondPlayersFirstTurn =
    PLAYER_2_SKIP_FIRST_DRAW &&
    newActiveId === previousInactiveId &&
    newActivePlayer.board.length === 0 &&
    newActivePlayer.discard.length === 0

  if (!isSecondPlayersFirstTurn) {
    drawCards(newActivePlayer)
  }

  state.logs.push(
    formatString(messages.reducer.switchTurn, {
      playerName: newActivePlayer.name,
    }),
  )
}
