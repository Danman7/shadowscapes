import { createSlice } from '@reduxjs/toolkit'

import type { Duel } from 'src/game-engine/types'

import * as cardReducers from 'src/game-engine/duel/reducers/cardReducers'
import * as instantReducers from 'src/game-engine/duel/reducers/instantReducers'
import * as turnReducers from 'src/game-engine/duel/reducers/turnReducers'

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
    startDuel: turnReducers.startDuel,
    startInitialDraw: turnReducers.startInitialDraw,
    goToRedraw: turnReducers.goToRedraw,
    startFirstPlayerTurn: turnReducers.startFirstPlayerTurn,
    goToEndOfTurn: turnReducers.goToEndOfTurn,
    switchTurn: turnReducers.switchTurn,
    playCard: cardReducers.playCard,
    redrawCard: cardReducers.redrawCard,
    skipRedraw: cardReducers.skipRedraw,
    attackCard: cardReducers.attackCard,
    attackPlayer: cardReducers.attackPlayer,
    _cleanupDefeatedCharacters: cardReducers.cleanupDefeatedCharacters,
    setPendingInstant: instantReducers.setPendingInstant,
    applySpeedPotion: instantReducers.applySpeedPotion,
    applyFlashBomb: instantReducers.applyFlashBomb,
    _applyEffects: (_state: Duel, action: { payload: Duel }) => action.payload,
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
  _cleanupDefeatedCharacters,
  setPendingInstant,
  applySpeedPotion,
  applyFlashBomb,
  _applyEffects,
} = duelSlice.actions

export const duelReducer = duelSlice.reducer
export default duelSlice
