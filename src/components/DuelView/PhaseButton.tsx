import { type ReactNode } from 'react'

import { Button } from 'src/components'
import { useGameDispatch } from 'src/contexts'
import type { CardInstance, Phase, Player } from 'src/game-engine'
import { goToEndOfTurn, skipRedraw, switchTurn } from 'src/game-engine/duel'
import { messages } from 'src/i18n'

export const PhaseButton: React.FC<{
  phase: Phase
  activePlayer: Player
  activeBoard: CardInstance[]
  onTurnEnd: () => void
}> = ({ phase, activePlayer, activeBoard, onTurnEnd }) => {
  const dispatch = useGameDispatch()
  const { playerReady } = activePlayer

  let phaseButtonLabel: ReactNode = null
  let phaseButtonOnClick: (() => void) | undefined = undefined

  switch (phase) {
    case 'redraw':
      phaseButtonLabel = !playerReady
        ? messages.ui.skipRedraw
        : messages.ui.waitingForOpponent

      phaseButtonOnClick = !playerReady
        ? () => dispatch(skipRedraw({ playerId: activePlayer.id }))
        : undefined
      break

    case 'player-turn':
      phaseButtonLabel = messages.ui.pass
      phaseButtonOnClick = () => {
        const allStunned =
          activeBoard.length > 0 &&
          activeBoard.every((c) => c.attributes.isStunned)
        if (activeBoard.length === 0 || allStunned) {
          dispatch(switchTurn())
        } else {
          dispatch(goToEndOfTurn())
        }
      }
      break

    case 'turn-end':
      phaseButtonLabel = messages.ui.endTurn
      phaseButtonOnClick = () => {
        onTurnEnd()
        dispatch(switchTurn())
      }
      break

    default:
      phaseButtonLabel = ''
      phaseButtonOnClick = undefined
      break
  }

  return (
    phaseButtonLabel && (
      <div className="w-1/3 flex place-content-end">
        <Button
          className="animate-slide-right"
          onClick={phaseButtonOnClick}
          data-testid="phase-button"
        >
          {phaseButtonLabel}
        </Button>
      </div>
    )
  )
}
