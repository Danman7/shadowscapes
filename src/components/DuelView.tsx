import { type ReactNode, useEffect, useState } from 'react'

import { Board } from '@/components/Board'
import { Button } from '@/components/Button'
import { FaceDownPile } from '@/components/FaceDownPile'
import { Hand } from '@/components/Hand'
import { PlayerBadge } from '@/components/PlayerBadge'
import { useGameDispatch } from '@/contexts/GameContext'
import {
  useActivePlayer,
  useActivePlayerBoard,
  useActivePlayerCoins,
  useActivePlayerHand,
  useDuelPhase,
  useInactivePlayer,
  useInactivePlayerBoard,
  useInactivePlayerHand,
  usePlayerDeckCount,
  usePlayerDiscardCount,
} from '@/selectors/playerSelectors'
import type { CardInstance, Phase, Player } from '@/types'

const PhaseInfo: React.FC<{ phase: Phase; activePlayerName: string }> = ({
  phase,
  activePlayerName,
}) => {
  let phaseInfoText: ReactNode = null

  switch (phase) {
    case 'initial-draw':
      phaseInfoText = 'Draw cards'
      break

    case 'redraw':
      phaseInfoText = 'Redraw phase'
      break

    case 'player-turn':
    case 'turn-end':
      phaseInfoText = `${activePlayerName}'s Turn`
      break

    default:
      phaseInfoText = ''
      break
  }

  return (
    <div data-testid="phase-info" className="text-lg font-semibold">
      {phaseInfoText}
    </div>
  )
}

const PhaseButton: React.FC<{
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
        ? 'Skip redraw'
        : 'Waiting for opponent...'

      phaseButtonOnClick = !playerReady
        ? () =>
            dispatch({
              type: 'PLAYER_READY',
              payload: { playerId: activePlayer.id },
            })
        : undefined
      break

    case 'player-turn':
      phaseButtonLabel = 'End Turn'
      phaseButtonOnClick = () => {
        if (activeBoard.length > 0) {
          dispatch({ type: 'TRANSITION_PHASE', payload: 'turn-end' })
        } else {
          dispatch({ type: 'SWITCH_TURN' })
        }
      }
      break

    case 'turn-end':
      phaseButtonLabel = 'End Turn'
      phaseButtonOnClick = () => {
        onTurnEnd()
        dispatch({ type: 'SWITCH_TURN' })
      }
      break

    default:
      phaseButtonLabel = ''
      phaseButtonOnClick = undefined
      break
  }

  return (
    phaseButtonLabel && (
      <Button onClick={phaseButtonOnClick} data-testid="phase-button">
        {phaseButtonLabel}
      </Button>
    )
  )
}

export const DuelView: React.FC = () => {
  const dispatch = useGameDispatch()
  const phase = useDuelPhase()
  const activePlayer = useActivePlayer()
  const inactivePlayer = useInactivePlayer()
  const activePlayerCoins = useActivePlayerCoins()

  const [selectedAttackerId, setSelectedAttackerId] = useState<number | null>(
    null,
  )

  useEffect(() => {
    if (phase === 'intro')
      dispatch({ type: 'TRANSITION_PHASE', payload: 'initial-draw' })
  }, [dispatch, phase])

  useEffect(() => {
    if (phase === 'redraw') {
      dispatch({
        type: 'PLAYER_READY',
        payload: { playerId: inactivePlayer.id },
      })

      if (activePlayer.playerReady && inactivePlayer.playerReady) {
        dispatch({ type: 'TRANSITION_PHASE', payload: 'player-turn' })
      }
    }
  }, [
    dispatch,
    phase,
    inactivePlayer.id,
    activePlayer.playerReady,
    inactivePlayer.playerReady,
  ])

  useEffect(() => {
    if (phase === 'initial-draw') dispatch({ type: 'INITIAL_DRAW' })
  }, [dispatch, phase])

  const activeHand = useActivePlayerHand()
  const inactiveHand = useInactivePlayerHand()
  const activeBoard = useActivePlayerBoard()
  const inactiveBoard = useInactivePlayerBoard()

  useEffect(() => {
    if (phase === 'turn-end') {
      const allActiveCardsActed = activeBoard.every((card) => card.didAct)

      if (activeBoard.length === 0) {
        dispatch({ type: 'SWITCH_TURN' })
      } else if (inactiveBoard.length === 0) {
        if (allActiveCardsActed) {
          dispatch({ type: 'SWITCH_TURN' })
        } else {
          const nextAttacker = activeBoard.find((card) => !card.didAct)
          if (nextAttacker) {
            dispatch({
              type: 'ATTACK_PLAYER',
              payload: { attackerId: nextAttacker.id },
            })
          }
        }
      } else if (allActiveCardsActed) {
        dispatch({ type: 'SWITCH_TURN' })
      }
    }
  }, [dispatch, phase, activeBoard, inactiveBoard.length])

  const activeDeckCount = usePlayerDeckCount(activePlayer.id)
  const activeDiscardCount = usePlayerDiscardCount(activePlayer.id)
  const inactiveDeckCount = usePlayerDeckCount(inactivePlayer.id)
  const inactiveDiscardCount = usePlayerDiscardCount(inactivePlayer.id)

  const getOnCardClick = (cardId: number): (() => void) | undefined => {
    if (phase === 'redraw') {
      if (activePlayer.playerReady) return undefined

      return () => {
        dispatch({
          type: 'REDRAW_CARD',
          payload: { playerId: activePlayer.id, cardInstanceId: cardId },
        })
      }
    }

    if (phase === 'player-turn') {
      const cardInstance = activeHand.find((c) => c.id === cardId)
      if (!cardInstance) return undefined

      if (cardInstance.cost > activePlayerCoins) return undefined

      return () => {
        dispatch({
          type: 'PLAY_CARD',
          payload: { playerId: activePlayer.id, cardInstanceId: cardId },
        })
      }
    }

    return undefined
  }

  const getOnBoardCardClick = (
    cardId: number,
    isActiveBoard: boolean,
  ): (() => void) | undefined => {
    if (phase !== 'turn-end') return undefined

    if (isActiveBoard) {
      const cardInstance = activeBoard.find((c) => c.id === cardId)
      if (!cardInstance || cardInstance.didAct) return undefined

      return () => {
        setSelectedAttackerId(cardId)
      }
    } else {
      if (selectedAttackerId === null) return undefined

      const selectedCard = activeBoard.find((c) => c.id === selectedAttackerId)
      if (!selectedCard || selectedCard.didAct) return undefined

      const cardInstance = inactiveBoard.find((c) => c.id === cardId)
      if (!cardInstance) return undefined

      return () => {
        dispatch({
          type: 'ATTACK_CARD',
          payload: {
            attackerId: selectedAttackerId,
            defenderId: cardId,
          },
        })
        setSelectedAttackerId(null)
      }
    }
  }

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
        <Board
          cards={inactiveBoard}
          onCardClick={(cardId) => getOnBoardCardClick(cardId, false)}
        />
      </section>

      {/* Row 3: center bar */}
      <section className="col-[1/4] w-full px-4 row-3 flex justify-between place-items-center">
        <PhaseInfo phase={phase} activePlayerName={activePlayer.name} />

        <PhaseButton
          phase={phase}
          activePlayer={activePlayer}
          activeBoard={activeBoard}
          onTurnEnd={() => setSelectedAttackerId(null)}
        />
      </section>

      {/* Row 4: active board full width */}
      <section className="col-[1/4] row-4">
        <Board
          cards={activeBoard}
          onCardClick={(cardId) => getOnBoardCardClick(cardId, true)}
        />
      </section>

      {/* Row 5: active discard / hand / deck */}
      <section className="col-1 row-5">
        <FaceDownPile count={activeDiscardCount} label="Discard" />
      </section>

      <section className="col-2 row-5 relative">
        <Hand cards={activeHand} isActive={true} onCardClick={getOnCardClick} />

        <PlayerBadge player={activePlayer} isActive />
      </section>

      <section className="col-3 row-5">
        <FaceDownPile count={activeDeckCount} label="Deck" />
      </section>
    </div>
  )
}
