import { messages } from 'src/i18n'
import { useDuel } from 'src/modules/duel/hooks'
import { PlayerStack } from 'src/modules/duel/types'

export const useOnBoardCardClick = (
  stack: PlayerStack,
  doesCardBelongToUser: boolean,
) => {
  let helperContent = ''
  let onCardClick = undefined

  const {
    state: { phase },
  } = useDuel()

  if (phase === 'Redrawing' && stack === 'hand' && doesCardBelongToUser) {
    onCardClick = () => {}
    helperContent = messages.duel.replaceCard
  }

  return { helperContent, onCardClick }
}
