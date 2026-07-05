import { useEffect } from 'react'

import { drawForPlayers } from '../state'
import { useDuelDispatch } from './useDuelDispatch'
import { useDuelState } from './useDuelState'

export const usePlayersDraw = () => {
  const dispatch = useDuelDispatch()
  const { phase } = useDuelState()

  useEffect(() => {
    if (phase === 'draw') dispatch(drawForPlayers())
  }, [dispatch, phase])
}
