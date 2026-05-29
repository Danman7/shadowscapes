import { useState } from 'react'

import {
  Board,
  Button,
  FaceDownPile,
  Hand,
  Logs,
  PlayerBadge,
} from 'src/components'
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
  useActivePlayerDiscard,
  useActivePlayerHand,
  useDuelPhase,
  useInactivePlayer,
  useInactivePlayerBoard,
  useInactivePlayerHand,
  useLogs,
  usePendingCharacterAbility,
  usePendingInstant,
  usePlayerDeckCount,
  usePlayerDiscardCount,
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
  const activeDiscard = useActivePlayerDiscard()
  const inactiveHand = useInactivePlayerHand()
  const activeBoard = useActivePlayerBoard()
  const inactiveBoard = useInactivePlayerBoard()
  const activeDeckCount = usePlayerDeckCount(activePlayer.id)
  const activeDiscardCount = usePlayerDiscardCount(activePlayer.id)
  const inactiveDeckCount = usePlayerDeckCount(inactivePlayer.id)
  const inactiveDiscardCount = usePlayerDiscardCount(inactivePlayer.id)
  const selectedAttackerSelection = useScopedSelection(
    phase === 'turn-end' ? `${phase}:${activePlayer.id}` : null,
  )
  const { attackingCardId, requestAttackAnimation } = useAttackAnimation()

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

      <DiscardTargetDialog
        cards={activeDiscard}
        pendingInstant={pendingInstant}
      />
    </div>
  )
}
