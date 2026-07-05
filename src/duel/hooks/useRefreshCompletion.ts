import { useEffect } from 'react'

import { completeRefresh } from '../state'
import { useDuelDispatch } from './useDuelDispatch'
import { useDuelState } from './useDuelState'

export const useRefreshCompletion = () => {
  const dispatch = useDuelDispatch()
  const { phase } = useDuelState()

  useEffect(() => {
    if (phase === 'refresh') dispatch(completeRefresh())
  }, [dispatch, phase])
}
