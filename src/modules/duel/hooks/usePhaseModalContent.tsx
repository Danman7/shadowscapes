import { GiCardExchange } from 'react-icons/gi'

import { messages } from 'src/i18n'
import { useDuel } from 'src/modules/duel/hooks'

export const usePhaseModalContent = () => {
  let phaseModalContent: React.ReactNode = ''

  const {
    state: { phase },
  } = useDuel()

  switch (phase) {
    case 'Redrawing':
      phaseModalContent = (
        <h2>
          <GiCardExchange /> {messages.duel.redrawPhaseModal}
        </h2>
      )
      break

    default:
      break
  }

  return phaseModalContent
}
