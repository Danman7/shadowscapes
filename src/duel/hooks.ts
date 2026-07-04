import { useEffect } from 'react'

import { AppDispatch, useAppDispatch, useAppSelector } from '../redux'
import { AUTOMATED_ACTION_DELAY_MS, INITIAL_CARDS_DRAWN } from './constants'
import {
  completePlayTurn,
  drawForPlayers,
  drawInitialHands,
} from './state'
import { DuelState } from './types'

export const useDuelState = (): DuelState =>
  useAppSelector((state) => state.duel)
export const useDuelDispatch = (): AppDispatch => useAppDispatch()

export const usePlayersInitialDraw = () => {
  const dispatch = useDuelDispatch()
  const { phase, playerOrder, players } = useDuelState()
  const playersNeedInitialDraw = playerOrder.every(
    (playerId) => players[playerId].hand.length < INITIAL_CARDS_DRAWN,
  )

  useEffect(() => {
    if (phase === 'setup' && playersNeedInitialDraw) {
      dispatch(drawInitialHands())
    }
  }, [dispatch, phase, playersNeedInitialDraw])
}

export const usePlayersDraw = () => {
  const dispatch = useDuelDispatch()
  const { phase } = useDuelState()

  useEffect(() => {
    if (phase === 'draw') {
      dispatch(drawForPlayers())
    }
  }, [dispatch, phase])
}

export const usePlayTurnCompletion = () => {
  const dispatch = useDuelDispatch()
  const { phase, playerOrder, players } = useDuelState()
  const activePlayerId = playerOrder[0]
  const hasActivePlayerActed = players[activePlayerId]?.hasActedThisPhase

  useEffect(() => {
    if (phase !== 'play' || !hasActivePlayerActed) return

    const timeoutId = window.setTimeout(() => {
      dispatch(completePlayTurn())
    }, AUTOMATED_ACTION_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [activePlayerId, dispatch, hasActivePlayerActed, phase])
}
