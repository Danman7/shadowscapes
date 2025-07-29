import { useEffect } from 'react'

import { useDuel } from 'src/modules/duel/hooks'

export const useBot = (playerId: string) => {
  const {
    state: { phase, players },
    dispatch,
  } = useDuel()

  const { hasPerformedAction, isBot } = players[playerId]

  useEffect(() => {
    // Automatically skip redraw (for now)
    if (phase === 'Redrawing' && !hasPerformedAction && isBot) {
      dispatch({ type: 'SKIP_REDRAW', playerId })
    }
  }, [playerId, dispatch, phase, hasPerformedAction, isBot])
}
