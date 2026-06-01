import { LayoutGroup, motion, MotionConfig } from 'motion/react'
import { useEffect, useState } from 'react'

import {
  Board,
  Button,
  FaceDownPile,
  Hand,
  Logs,
  PlayerBadge,
} from 'src/components'
import { QUICK_TRANSITION, SLIDE_LEFT_VARIANTS } from 'src/components/animation'
import { DiscardTargetDialog } from 'src/components/DuelView/DiscardTargetDialog'
import { PhaseButton } from 'src/components/DuelView/PhaseButton'
import { useAttackAnimation } from 'src/components/DuelView/useAttackAnimation'
import { useCardClickHandlers } from 'src/components/DuelView/useCardClickHandlers'
import { useDuelAutoTransitions } from 'src/components/DuelView/useDuelAutoTransitions'
import { useScopedSelection } from 'src/components/DuelView/useScopedSelection'
import {
  useActivePlayer,
  useActivePlayerBoard,
  useActivePlayerCoins,
  useActivePlayerDeck,
  useActivePlayerDiscard,
  useActivePlayerHand,
  useDuelPhase,
  useInactivePlayer,
  useInactivePlayerBoard,
  useInactivePlayerDeck,
  useInactivePlayerDiscard,
  useInactivePlayerHand,
  useLogs,
  usePendingCharacterAbility,
  usePendingInstant,
} from 'src/contexts'
import { messages } from 'src/i18n'

export const DuelView: React.FC = () => {
  const phase = useDuelPhase()
  const activePlayer = useActivePlayer()
  const inactivePlayer = useInactivePlayer()
  const activePlayerCoins = useActivePlayerCoins()
  const logs = useLogs()
  const [areLogsVisible, setAreLogsVisible] = useState(false)
  const pendingCharacterAbility = usePendingCharacterAbility()
  const pendingInstant = usePendingInstant()
  const activeHand = useActivePlayerHand()
  const activeDeck = useActivePlayerDeck()
  const activeDiscard = useActivePlayerDiscard()
  const inactiveHand = useInactivePlayerHand()
  const inactiveDeck = useInactivePlayerDeck()
  const inactiveDiscard = useInactivePlayerDiscard()
  const activeBoard = useActivePlayerBoard()
  const inactiveBoard = useInactivePlayerBoard()
  const activeDeckCount = activePlayer.deck.length
  const [layoutActivePlayerId, setLayoutActivePlayerId] = useState(
    activePlayer.id,
  )
  const isActivePlayerSwitching = layoutActivePlayerId !== activePlayer.id
  const isCardLayoutEnabled = !isActivePlayerSwitching
  const selectedAttackerSelection = useScopedSelection(
    phase === 'turn-end' ? `${phase}:${activePlayer.id}` : null,
  )
  const { attackingCardId, requestAttackAnimation } = useAttackAnimation()

  useEffect(() => {
    if (!isActivePlayerSwitching) return

    const animationFrameId = window.requestAnimationFrame(() => {
      setLayoutActivePlayerId(activePlayer.id)
    })

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [activePlayer.id, isActivePlayerSwitching])

  useDuelAutoTransitions({
    phase,
    activePlayer,
    inactivePlayer,
    activeHandCount: activeHand.length,
    activeDeckCount,
    activeBoard,
    inactiveBoardCount: inactiveBoard.length,
    pendingInstant,
  })

  const { getOnCardClick, getOnBoardCardClick } = useCardClickHandlers({
    phase,
    activePlayer,
    activePlayerCoins,
    activeHand,
    activeBoard,
    inactiveBoard,
    pendingCharacterAbility,
    pendingInstant,
    selectedAttackerSelection,
    requestAttackAnimation,
  })

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id="duel-card-stacks">
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
              cards={inactiveDiscard}
              count={inactivePlayer.discard.length}
              isCardLayoutEnabled={isCardLayoutEnabled}
              label={messages.ui.discard}
            />
          </section>

          <section className="col-2 row-1 relative">
            <PlayerBadge player={inactivePlayer} />

            <Hand
              cards={inactiveHand}
              isCardLayoutEnabled={isCardLayoutEnabled}
              isOnTop
            />
          </section>

          <section className="col-3 row-1">
            <FaceDownPile
              flipped
              cards={inactiveDeck}
              count={inactivePlayer.deck.length}
              isCardLayoutEnabled={isCardLayoutEnabled}
              label={messages.ui.deck}
            />
          </section>

          {/* Row 2: inactive board full width */}
          <section className="col-[1/4] row-2 justify-center items-end flex">
            <Board
              cards={inactiveBoard}
              isCardLayoutEnabled={isCardLayoutEnabled}
              isTopBoard
              attackingCardId={attackingCardId}
              onCardClick={(cardId) => getOnBoardCardClick(cardId, false)}
            />
          </section>

          {/* Row 3: center bar */}
          <section className="col-[1/4] w-full px-2 row-3 flex justify-between place-items-center">
            <div className="flex items-start gap-2 w-1/3">
              {!areLogsVisible && logs.length > 0 && (
                <motion.div
                  variants={SLIDE_LEFT_VARIANTS}
                  initial="initial"
                  animate="animate"
                  transition={QUICK_TRANSITION}
                >
                  <Button
                    onClick={() => setAreLogsVisible(true)}
                    data-testid="logs-toggle-button"
                    isSecondary
                  >
                    {messages.ui.logs}
                  </Button>
                </motion.div>
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
              isCardLayoutEnabled={isCardLayoutEnabled}
              attackingCardId={attackingCardId}
              onCardClick={(cardId) => getOnBoardCardClick(cardId, true)}
            />
          </section>

          {/* Row 5: active discard / hand / deck */}
          <section className="col-1 row-5">
            <FaceDownPile
              cards={activeDiscard}
              count={activePlayer.discard.length}
              isCardLayoutEnabled={isCardLayoutEnabled}
              label={messages.ui.discard}
            />
          </section>

          <section className="col-2 row-5 relative">
            <Hand
              cards={activeHand}
              isCardLayoutEnabled={isCardLayoutEnabled}
              isActive={true}
              onCardClick={getOnCardClick}
            />

            <PlayerBadge player={activePlayer} isActive />
          </section>

          <section className="col-3 row-5">
            <FaceDownPile
              cards={activeDeck}
              count={activePlayer.deck.length}
              isCardLayoutEnabled={isCardLayoutEnabled}
              label={messages.ui.deck}
            />
          </section>

          <DiscardTargetDialog
            cards={activeDiscard}
            pendingInstant={pendingInstant}
          />
        </div>
      </LayoutGroup>
    </MotionConfig>
  )
}
