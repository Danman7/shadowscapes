import { useEffect } from 'react'

import { useDuel } from 'src/modules/duel/hooks'

export const useStartFirstTurn = () => {
  const {
    state: { players, phase },
    dispatch,
  } = useDuel()

  useEffect(() => {
    if (phase === 'Redrawing') {
      const allPlayersPerformedAction = Object.values(players).every(
        (player) => player.hasPerformedAction,
      )

      if (allPlayersPerformedAction) {
        dispatch({ type: 'BEGIN_FIRST_TURN' })
      }
    }
  }, [phase, players, dispatch])
}
