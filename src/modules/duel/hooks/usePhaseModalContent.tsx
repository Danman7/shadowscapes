import { useEffect, useState } from 'react'
import { GiCardExchange } from 'react-icons/gi'

import { messages } from 'src/i18n'
import { useDuel } from 'src/modules/duel/hooks'

export const usePhaseModalContent = () => {
  const [phaseModalContent, setPhaseModalContent] =
    useState<React.ReactNode>('')

  const {
    state: { phase },
  } = useDuel()

  useEffect(() => {
    switch (phase) {
      case 'Redrawing':
        setPhaseModalContent(
          <h2>
            <GiCardExchange /> {messages.duel.redrawPhaseModal}
          </h2>,
        )
        break

      default:
        break
    }
  }, [phase])

  return phaseModalContent
}
