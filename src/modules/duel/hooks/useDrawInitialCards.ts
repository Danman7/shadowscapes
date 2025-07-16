import { useEffect } from 'react'
import { useTheme } from 'styled-components'

import { useDuel } from 'src/modules/duel/hooks'

export const useDrawInitialCards = () => {
  const {
    state: { players, phase },
    dispatch,
  } = useDuel()

  const { transitionTime } = useTheme()

  useEffect(() => {
    let timerId: NodeJS.Timeout

    if (phase === 'Initial Draw') {
      const allPlayersHaveEmptyHands = Object.values(players).every(
        (player) => player.hand.length === 0,
      )

      if (allPlayersHaveEmptyHands) {
        timerId = setTimeout(() => {
          dispatch({ type: 'DRAW_INITIAL_CARDS' })
        }, transitionTime * 6)
      }
    }

    return () => {
      if (timerId) clearTimeout(timerId)
    }
  }, [phase, players, transitionTime, dispatch])
}
