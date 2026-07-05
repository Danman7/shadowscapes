import { useEffect } from 'react'

import { AUTOMATED_ACTION_DELAY_MS } from '../constants'
import { completePlayTurn } from '../state'
import { useDuelDispatch } from './useDuelDispatch'
import { useDuelState } from './useDuelState'

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
