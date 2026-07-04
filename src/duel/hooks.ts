import { useEffect } from 'react'

import { AppDispatch, useAppDispatch, useAppSelector } from '../redux'
import { INITIAL_CARDS_DRAWN } from './constants'
import { drawForPlayers, drawInitialHands } from './state'
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
