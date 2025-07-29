import { useTheme } from 'styled-components'

import { messages } from 'src/i18n'
import { useDuel } from 'src/modules/duel/hooks'
import { PlayerStack } from 'src/modules/duel/types'
import { useUser } from 'src/modules/user/hooks'

export const useOnBoardCardClick = (
  stack: PlayerStack,
  doesCardBelongToUser: boolean,
  cardId: string,
  playerId: string,
) => {
  let helperContent = ''
  let onCardClick = undefined

  const {
    state: { phase, players, activePlayerId, inactivePlayerId },
    dispatch,
  } = useDuel()

  const { transitionTime } = useTheme()

  const {
    state: {
      user: { id },
    },
  } = useUser()

  const userIsInGame = [activePlayerId, inactivePlayerId].includes(id)
  const playerIsReady = userIsInGame && players[playerId].hasPerformedAction

  const onRedrawClick = () => {
    dispatch({
      type: 'REDRAW_CARD',
      playerId: playerId,
      cardId: cardId,
    })

    dispatch({
      type: 'READY_WITH_REDRAW',
      playerId,
    })

    setTimeout(() => {
      dispatch({
        type: 'DRAW_A_CARD',
        playerId: playerId,
      })
    }, transitionTime * 2)
  }

  if (
    phase === 'Redrawing' &&
    stack === 'hand' &&
    doesCardBelongToUser &&
    !playerIsReady
  ) {
    onCardClick = onRedrawClick
    helperContent = messages.duel.replaceCard
  }

  return { helperContent, onCardClick }
}
