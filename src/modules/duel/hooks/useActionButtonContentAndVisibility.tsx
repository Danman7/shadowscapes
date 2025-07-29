import { GiCardDiscard } from 'react-icons/gi'

import { MoonLoading } from 'src/components/MoonLoading'
import { messages } from 'src/i18n'
import { useDuel } from 'src/modules/duel/hooks'
import { useUser } from 'src/modules/user/hooks'

export const useActionButtonContentAndVisibility = () => {
  let actionButtonContent: React.ReactNode = ''
  let isActionButtonVisible = false
  let actionButtonOnClick: (() => void) | undefined = undefined

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
      actionButtonContent = playerIsReady ? (
        <>
          <MoonLoading /> {messages.duel.waitForOpponent}
        </>
      ) : (
        <>
          <GiCardDiscard /> {messages.duel.skipRedraw}
        </>
      )
      isActionButtonVisible = userIsInGame

      actionButtonOnClick =
        playerIsReady || !userIsInGame
          ? undefined
          : () => {
              dispatch({ type: 'SKIP_REDRAW', playerId: id })
            }
      break

    default:
      break
  }

  return {
    isActionButtonVisible,
    actionButtonContent,
    actionButtonOnClick,
  }
}
