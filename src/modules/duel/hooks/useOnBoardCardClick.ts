import { useTheme } from 'styled-components'

import { messages } from 'src/i18n'
import { useDuel } from 'src/modules/duel/hooks'
import { PlayerStack } from 'src/modules/duel/types'

export const useOnBoardCardClick = (
  stack: PlayerStack,
  doesCardBelongToUser: boolean,
  cardId: string,
  playerId: string,
) => {
  let helperContent = ''
  let onCardClick = undefined

  const {
    state: { phase },
    dispatch,
  } = useDuel()

  const { transitionTime } = useTheme()

  const onRedrawClick = () => {
    dispatch({
      type: 'PUT_CARD_AT_BOTTOM_OF_DECK',
      playerId: playerId,
      cardId: cardId,
    })

    setTimeout(() => {
      dispatch({
        type: 'DRAW_A_CARD',
        playerId: playerId,
      })
    }, transitionTime * 2)
  }

  if (phase === 'Redrawing' && stack === 'hand' && doesCardBelongToUser) {
    onCardClick = onRedrawClick
    helperContent = messages.duel.replaceCard
  }

  return { helperContent, onCardClick }
}
