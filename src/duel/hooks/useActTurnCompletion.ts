import { useEffect } from 'react'

import { AUTOMATED_ACTION_DELAY_MS } from '../constants'
import { completeActTurn } from '../state'
import { canActTurnComplete } from '../utils'
import { useDuelDispatch } from './useDuelDispatch'
import { useDuelState } from './useDuelState'

export const useActTurnCompletion = () => {
  const dispatch = useDuelDispatch()
  const duelState = useDuelState()
  const { actPlayerId, phase } = duelState
  const canComplete = canActTurnComplete(duelState)

  useEffect(() => {
    if (phase !== 'act' || !actPlayerId || !canComplete) return

    const timeoutId = window.setTimeout(() => {
      dispatch(completeActTurn())
    }, AUTOMATED_ACTION_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [actPlayerId, canComplete, dispatch, phase])
}
