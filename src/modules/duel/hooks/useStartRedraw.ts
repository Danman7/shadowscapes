import { useEffect } from 'react'
import { useTheme } from 'styled-components'

import { INITIAL_CARDS_DRAWN_AMOUNT } from 'src/modules/duel/constants'
import { useDuel } from 'src/modules/duel/hooks'

export const useStartRedraw = () => {
  const {
    state: { phase, players },
    dispatch,
  } = useDuel()

  const { transitionTime } = useTheme()

  useEffect(() => {
    if (phase === 'Initial Draw') {
      let timerId: NodeJS.Timeout

      const allPlayersHaveDrawnInitialCards = Object.values(players).every(
        (player) => player.hand.length === INITIAL_CARDS_DRAWN_AMOUNT,
      )

      if (allPlayersHaveDrawnInitialCards) {
        timerId = setTimeout(() => {
          dispatch({ type: 'PROGRESS_TO_REDRAW' })
        }, transitionTime * 4)
      }

      return () => {
        if (timerId) clearTimeout(timerId)
      }
    }
  }, [phase, players, transitionTime, dispatch])
}
