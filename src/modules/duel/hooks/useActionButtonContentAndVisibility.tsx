import { GiCardDiscard } from 'react-icons/gi'

import { MoonLoading } from 'src/components/MoonLoading'
import { messages } from 'src/i18n'
import { useDuel } from 'src/modules/duel/hooks'
import { useUser } from 'src/modules/user/hooks'

export const useActionButtonContentAndVisibility = () => {
  let buttonContent: React.ReactNode = ''
  let isButtonVisible = false
  let buttonOnClick: (() => void) | undefined = undefined

  const {
    state: {
      user: { id },
    },
  } = useUser()

  const {
    state: { phase, activePlayerId, inactivePlayerId, players },
    dispatch,
  } = useDuel()

  const userIsInGame = [activePlayerId, inactivePlayerId].includes(id)
  const playerIsReady = userIsInGame && players[id].hasPerformedAction

  switch (phase) {
    case 'Redrawing':
      buttonContent = playerIsReady ? (
        <>
          <MoonLoading /> {messages.duel.waitForOpponent}
        </>
      ) : (
        <>
          <GiCardDiscard /> {messages.duel.skipRedraw}
        </>
      )
      isButtonVisible = userIsInGame

      buttonOnClick =
        playerIsReady || !userIsInGame
          ? undefined
          : () => {
              dispatch({ type: 'PLAYER_READY_WITH_REDRAW', playerId: id })
            }
      break

    default:
      break
  }

  return { isButtonVisible, buttonContent, buttonOnClick }
}
