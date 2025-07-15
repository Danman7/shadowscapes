import { useEffect } from 'react'
import { useTheme } from 'styled-components'

import { useDuel } from 'src/modules/duel/hooks'

export const useIntroScreenTimer = () => {
  const { state, dispatch } = useDuel()
  const { phase } = state
  const { transitionTime } = useTheme()

  useEffect(() => {
    let timerId: NodeJS.Timeout

    if (phase === 'Intro Screen') {
      timerId = setTimeout(() => {
        dispatch({ type: 'PROGRESS_TO_INITIAL_DRAW' })
      }, transitionTime * 32)
    }

    return () => {
      if (timerId) clearTimeout(timerId)
    }
  }, [phase, transitionTime, dispatch])
}
