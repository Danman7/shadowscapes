import { type ReactNode, useEffect, useRef, useState } from 'react'

import {
  Board,
  Button,
  FaceDownPile,
  Hand,
  Logs,
  PlayerBadge,
} from 'src/components'
import { useScopedSelection } from 'src/components/useScopedSelection'
import {
  useActivePlayer,
  useActivePlayerBoard,
  useActivePlayerCoins,
  useActivePlayerHand,
  useDuelPhase,
  useGameDispatch,
  useInactivePlayer,
  useInactivePlayerBoard,
  useInactivePlayerHand,
  useLogs,
  usePendingCharacterAbility,
  usePendingInstant,
  usePlayerDeckCount,
  usePlayerDiscardCount,
} from 'src/contexts'
import type { CardInstance, Phase, Player } from 'src/game-engine'
import {
  activateCharacterAbility,
  applyFlashBomb,
  applySpeedPotion,
  attackCard,
  attackPlayer,
  goToEndOfTurn,
  goToRedraw,
  playCard,
  redrawCard,
  skipRedraw,
  startFirstPlayerTurn,
  startInitialDraw,
  switchTurn,
} from 'src/game-engine/duel'
import { messages } from 'src/i18n'

const ATTACK_ANIMATION_MS = 350

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

export const DuelView: React.FC = () => {
  const dispatch = useGameDispatch()
  const phase = useDuelPhase()
  const activePlayer = useActivePlayer()
  const inactivePlayer = useInactivePlayer()
  const activePlayerCoins = useActivePlayerCoins()
  const logs = useLogs()
  const [areLogsVisible, setAreLogsVisible] = useState(false)
  const [attackingCardId, setAttackingCardId] = useState<string | null>(null)
  const attackAnimationTimeoutRef = useRef<number | null>(null)
  const pendingCharacterAbility = usePendingCharacterAbility()
  const pendingInstant = usePendingInstant()
  const selectedAttackerSelection = useScopedSelection(
    phase === 'turn-end' ? `${phase}:${activePlayer.id}` : null,
  )

  const triggerAttackAnimation = (attackerId: string): void => {
    setAttackingCardId(attackerId)

    if (attackAnimationTimeoutRef.current !== null) {
      window.clearTimeout(attackAnimationTimeoutRef.current)
    }

    attackAnimationTimeoutRef.current = window.setTimeout(() => {
      setAttackingCardId(null)
      attackAnimationTimeoutRef.current = null
    }, ATTACK_ANIMATION_MS)
  }

  useEffect(() => {
    if (phase === 'intro') dispatch(startInitialDraw())
    if (phase === 'initial-draw') dispatch(goToRedraw())
  }, [dispatch, phase])

  useEffect(() => {
    if (phase === 'redraw') {
      dispatch(skipRedraw({ playerId: inactivePlayer.id }))
    }
  }, [dispatch, inactivePlayer.id, phase])

  useEffect(() => {
    if (
      phase === 'redraw' &&
      activePlayer.playerReady &&
      inactivePlayer.playerReady
    ) {
      dispatch(startFirstPlayerTurn())
    }
  }, [activePlayer.playerReady, dispatch, inactivePlayer.playerReady, phase])

  const activeHand = useActivePlayerHand()
  const inactiveHand = useInactivePlayerHand()
  const activeBoard = useActivePlayerBoard()
  const inactiveBoard = useInactivePlayerBoard()

  useEffect(() => {
    return () => {
      if (attackAnimationTimeoutRef.current !== null)
        window.clearTimeout(attackAnimationTimeoutRef.current)
    }
  }, [])

  const activeDeckCount = usePlayerDeckCount(activePlayer.id)
  const activeDiscardCount = usePlayerDiscardCount(activePlayer.id)
  const inactiveDeckCount = usePlayerDeckCount(inactivePlayer.id)
  const inactiveDiscardCount = usePlayerDiscardCount(inactivePlayer.id)

  useEffect(() => {
    if (phase === 'player-turn') {
      if (activeHand.length === 0 && activeDeckCount === 0) {
        dispatch(goToEndOfTurn())
      }
    }
  }, [dispatch, phase, activeHand.length, activeDeckCount])

  useEffect(() => {
    if (phase === 'turn-end') {
      const allActiveCardsActed = activeBoard.every(
        (card) => card.didAct || card.attributes.isStunned,
      )

      if (pendingInstant !== null) return

      if (activeBoard.length === 0) {
        dispatch(switchTurn())
      } else if (inactiveBoard.length === 0) {
        if (allActiveCardsActed) {
          dispatch(switchTurn())
        }
      } else if (allActiveCardsActed) {
        dispatch(switchTurn())
      }
    }
  }, [dispatch, phase, activeBoard, inactiveBoard.length, pendingInstant])

  const getOnCardClick = (cardId: string): (() => void) | undefined => {
    if (phase === 'redraw') {
      if (activePlayer.playerReady) return undefined

      return () => {
        dispatch(
          redrawCard({ playerId: activePlayer.id, cardInstanceId: cardId }),
        )
      }
    }

    if (phase === 'turn-end' && pendingInstant === 'SPEED_POTION') {
      const cardInstance = activeHand.find((c) => c.id === cardId)
      if (!cardInstance) return undefined
      if (cardInstance.base.type !== 'Character') return undefined

      return () => {
        dispatch(applySpeedPotion({ targetCardInstanceId: cardId }))
      }
    }

    if (phase === 'player-turn') {
      const cardInstance = activeHand.find((c) => c.id === cardId)
      if (!cardInstance) return undefined

      if (cardInstance.attributes.cost > activePlayerCoins) return undefined

      return () => {
        dispatch(
          playCard({ playerId: activePlayer.id, cardInstanceId: cardId }),
        )
      }
    }

    return undefined
  }

  const getOnBoardCardClick = (
    cardId: string,
    isActiveBoard: boolean,
  ): (() => void) | undefined => {
    if (pendingInstant === 'FLASH_BOMB') {
      return () => {
        dispatch(applyFlashBomb({ targetCardInstanceId: cardId }))
      }
    }

    if (phase === 'player-turn') {
      if (!isActiveBoard && pendingCharacterAbility !== null) {
        return () => {
          triggerAttackAnimation(pendingCharacterAbility.sourceCardInstanceId)
          dispatch(activateCharacterAbility({ cardInstanceId: cardId }))
        }
      }

      if (!isActiveBoard) return undefined

      return () => {
        dispatch(activateCharacterAbility({ cardInstanceId: cardId }))
      }
    }

    if (phase !== 'turn-end') return undefined

    if (isActiveBoard) {
      const cardInstance = activeBoard.find((c) => c.id === cardId)
      if (
        !cardInstance ||
        cardInstance.didAct ||
        cardInstance.attributes.isStunned
      )
        return undefined

      if (inactiveBoard.length === 0) {
        return () => {
          triggerAttackAnimation(cardId)
          dispatch(attackPlayer({ attackerId: cardId }))
        }
      }

      return () => {
        selectedAttackerSelection.select(cardId)
      }
    } else {
      const selectedAttackerId = selectedAttackerSelection.selectedId
      if (selectedAttackerId === null) return undefined

      const selectedCard = activeBoard.find((c) => c.id === selectedAttackerId)
      if (!selectedCard || selectedCard.didAct) return undefined

      const cardInstance = inactiveBoard.find((c) => c.id === cardId)
      if (!cardInstance) return undefined

      return () => {
        triggerAttackAnimation(selectedAttackerId)
        dispatch(
          attackCard({
            attackerId: selectedAttackerId,
            defenderId: cardId,
          }),
        )
        selectedAttackerSelection.clear()
      }
    }
  }

  return (
    <div
      className="grid h-screen gap-2
        grid-cols-[100px_minmax(0,2fr)_100px]
        grid-rows-[140px_1fr_50px_1fr_140px] overflow-hidden"
      data-testid="duel-view"
    >
      {/* Row 1: inactive discard / hand / deck */}
      <section className="col-1 row-1">
        <FaceDownPile
          flipped
          count={inactiveDiscardCount}
          label={messages.ui.discard}
        />
      </section>

      <section className="col-2 row-1 relative">
        <PlayerBadge player={inactivePlayer} />

        <Hand cards={inactiveHand} isOnTop />
      </section>

      <section className="col-3 row-1">
        <FaceDownPile
          flipped
          count={inactiveDeckCount}
          label={messages.ui.deck}
        />
      </section>

      {/* Row 2: inactive board full width */}
      <section className="col-[1/4] row-2 justify-center items-end flex">
        <Board
          cards={inactiveBoard}
          isTopBoard
          attackingCardId={attackingCardId}
          onCardClick={(cardId) => getOnBoardCardClick(cardId, false)}
        />
      </section>

      {/* Row 3: center bar */}
      <section className="col-[1/4] w-full px-2 row-3 flex justify-between place-items-center">
        <div className="flex items-start gap-2 w-1/3">
          {!areLogsVisible && logs.length > 0 && (
            <Button
              className="animate-slide-left"
              onClick={() => setAreLogsVisible(true)}
              data-testid="logs-toggle-button"
              isSecondary
            >
              {messages.ui.logs}
            </Button>
          )}

          {areLogsVisible ? (
            <Logs onClose={() => setAreLogsVisible(false)} logs={logs} />
          ) : null}
        </div>

        <PhaseButton
          phase={phase}
          activePlayer={activePlayer}
          activeBoard={activeBoard}
          onTurnEnd={() => selectedAttackerSelection.clear()}
        />
      </section>

      {/* Row 4: active board full width */}
      <section className="col-[1/4] row-4">
        <Board
          cards={activeBoard}
          attackingCardId={attackingCardId}
          onCardClick={(cardId) => getOnBoardCardClick(cardId, true)}
        />
      </section>

      {/* Row 5: active discard / hand / deck */}
      <section className="col-1 row-5">
        <FaceDownPile count={activeDiscardCount} label={messages.ui.discard} />
      </section>

      <section className="col-2 row-5 relative">
        <Hand cards={activeHand} isActive={true} onCardClick={getOnCardClick} />

        <PlayerBadge player={activePlayer} isActive />
      </section>

      <section className="col-3 row-5">
        <FaceDownPile count={activeDeckCount} label={messages.ui.deck} />
      </section>
    </div>
  )
}
