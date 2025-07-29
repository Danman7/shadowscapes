import { useEffect, useState } from 'react'
import { GiCardExchange, GiCardPlay } from 'react-icons/gi'

import { formatString, messages } from 'src/i18n'
import { useDuel } from 'src/modules/duel/hooks'

export const usePhaseModalContent = () => {
  const [phaseModalContent, setPhaseModalContent] =
    useState<React.ReactNode>('')

  const {
    state: { phase, players, activePlayerId },
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

      case 'Player Turn':
        setPhaseModalContent(
          <h2>
            <GiCardPlay />{' '}
            {formatString(messages.duel.playerTurn, {
              playerName: players[activePlayerId].name,
            })}
          </h2>,
        )
        break

      default:
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  return phaseModalContent
}
