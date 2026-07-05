import { useEffect } from 'react'

import { INITIAL_CARDS_DRAWN } from '../constants'
import { drawInitialHands } from '../state'
import { useDuelDispatch } from './useDuelDispatch'
import { useDuelState } from './useDuelState'

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
