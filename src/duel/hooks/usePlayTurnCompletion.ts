import { useEffect } from 'react'

import { AUTOMATED_ACTION_DELAY_MS } from '../constants'
import { completePlayTurn } from '../state'
import { isAwaitingCardEffectTarget } from '../utils'
import { useDuelDispatch } from './useDuelDispatch'
import { useDuelState } from './useDuelState'

export const usePlayTurnCompletion = () => {
  const dispatch = useDuelDispatch()
  const duelState = useDuelState()
  const { phase, playerOrder, players } = duelState
  const activePlayerId = playerOrder[0]
  const hasActivePlayerActed = players[activePlayerId]?.hasActedThisPhase
  const isAwaitingTarget = isAwaitingCardEffectTarget(duelState)

  useEffect(() => {
    if (phase !== 'play' || !hasActivePlayerActed || isAwaitingTarget) return

    const timeoutId = window.setTimeout(() => {
      dispatch(completePlayTurn())
    }, AUTOMATED_ACTION_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [activePlayerId, dispatch, hasActivePlayerActed, isAwaitingTarget, phase])
}
