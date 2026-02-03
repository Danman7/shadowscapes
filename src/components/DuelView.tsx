import { type ReactNode, useEffect } from 'react'

import { Board } from '@/components/Board'
import { Button } from '@/components/Button'
import { FaceDownPile } from '@/components/FaceDownPile'
import { Hand } from '@/components/Hand'
import { PlayerBadge } from '@/components/PlayerBadge'
import { useGameDispatch } from '@/contexts/GameContext'
import {
  useActivePlayer,
  useActivePlayerBoard,
  useActivePlayerHand,
  useDuelPhase,
  useInactivePlayer,
  useInactivePlayerBoard,
  useInactivePlayerHand,
  usePlayerDeckCount,
  usePlayerDiscardCount,
} from '@/selectors/playerSelectors'
import type { Phase } from '@/types'

const PhaseInfo: React.FC<{ phase: Phase }> = ({ phase }) => {
  let phaseInfoText: ReactNode = null

  switch (phase) {
    case 'redraw':
      phaseInfoText = 'Redraw phase'
      break

    default:
      phaseInfoText = 'Draw cards'
      break
  }

  return (
    <div data-testid="phase-info" className="text-lg font-semibold">
      {phaseInfoText}
    </div>
  )
}

const PhaseButton: React.FC<{ phase: Phase }> = ({ phase }) => {
  const dispatch = useGameDispatch()

  let phaseButtonLabel: ReactNode = null
  let phaseButtonOnClick: (() => void) | null = null

  switch (phase) {
    case 'redraw':
      phaseButtonLabel = 'Skip redraw'
      phaseButtonOnClick = () =>
        dispatch({ type: 'TRANSITION_PHASE', payload: 'player-turn' })

      break

    default:
      phaseButtonLabel = 'End Turn'
      phaseButtonOnClick = () => dispatch({ type: 'SWITCH_TURN' })
      break
  }

  return (
    <Button onClick={phaseButtonOnClick} data-testid="phase-button">
      {phaseButtonLabel}
    </Button>
  )
}

export const DuelView: React.FC = () => {
  const dispatch = useGameDispatch()
  const phase = useDuelPhase()
  const activePlayer = useActivePlayer()
  const inactivePlayer = useInactivePlayer()

  useEffect(() => {
    if (phase === 'intro')
      dispatch({ type: 'TRANSITION_PHASE', payload: 'initial-draw' })
  }, [dispatch, phase])

  useEffect(() => {
    if (phase === 'initial-draw') dispatch({ type: 'INITIAL_DRAW' })
  }, [dispatch, phase])

  const activeHand = useActivePlayerHand()
  const inactiveHand = useInactivePlayerHand()
  const activeBoard = useActivePlayerBoard()
  const inactiveBoard = useInactivePlayerBoard()

  const activeDeckCount = usePlayerDeckCount(activePlayer.id)
  const activeDiscardCount = usePlayerDiscardCount(activePlayer.id)
  const inactiveDeckCount = usePlayerDeckCount(inactivePlayer.id)
  const inactiveDiscardCount = usePlayerDiscardCount(inactivePlayer.id)

  return (
    <div
      className="grid h-screen gap-4
        grid-cols-[120px_minmax(0,2fr)_120px]
        grid-rows-[140px_1fr_50px_1fr_140px] overflow-hidden"
      data-testid="duel-view"
    >
      {/* Row 1: inactive discard / hand / deck */}
      <section className="col-1 row-1">
        <FaceDownPile flipped count={inactiveDiscardCount} label="Discard" />
      </section>

      <section className="col-2 row-1 relative">
        <PlayerBadge player={inactivePlayer} />

        <Hand cards={inactiveHand} isOnTop />
      </section>

      <section className="col-3 row-1">
        <FaceDownPile flipped count={inactiveDeckCount} label="Deck" />
      </section>

      {/* Row 2: inactive board full width */}
      <section className="col-[1/4] row-2 justify-center items-end flex">
        <Board cards={inactiveBoard} />
      </section>

      {/* Row 3: center bar */}
      <section className="col-[1/4] w-full px-4 row-3 flex justify-between place-items-center">
        <PhaseInfo phase={phase} />

        <PhaseButton phase={phase} />
      </section>

      {/* Row 4: active board full width */}
      <section className="col-[1/4] row-4">
        <Board cards={activeBoard} />
      </section>

      {/* Row 5: active discard / hand / deck */}
      <section className="col-1 row-5">
        <FaceDownPile count={activeDiscardCount} label="Discard" />
      </section>

      <section className="col-2 row-5 relative">
        <Hand
          cards={activeHand}
          isActive={true}
          onCardClick={(cardId) => {
            dispatch({
              type: 'PLAY_CARD',
              payload: { playerId: activePlayer.id, cardInstanceId: cardId },
            })
          }}
        />

        <PlayerBadge player={activePlayer} isActive />
      </section>

      <section className="col-3 row-5">
        <FaceDownPile count={activeDeckCount} label="Deck" />
      </section>
    </div>
  )
}
