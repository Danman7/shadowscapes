import { Board } from '@/components/Board'
import { Button } from '@/components/Button'
import { FaceDownPile } from '@/components/FaceDownPile'
import { Hand } from '@/components/Hand'
import { useGameDispatch } from '@/contexts/GameContext'
import {
  useActivePlayer,
  useActivePlayerBoard,
  useActivePlayerHand,
  useDuelPhase,
  useInactivePlayer,
  useInactivePlayerBoard,
  usePlayerCards,
  usePlayerDeckCount,
  usePlayerDiscardCount,
} from '@/selectors/playerSelectors'

/**
 * DuelView component - main game view that orchestrates all game components
 * Renders different views based on game phase
 * Active player always displayed at bottom, inactive player at top
 */
export function DuelView() {
  const dispatch = useGameDispatch()
  const phase = useDuelPhase()
  const activePlayer = useActivePlayer()
  const inactivePlayer = useInactivePlayer()

  const activeHand = useActivePlayerHand()
  const activeBoard = useActivePlayerBoard()
  const inactiveBoard = useInactivePlayerBoard()

  const activeDeckCount = usePlayerDeckCount(activePlayer.id)
  const activeDiscardCount = usePlayerDiscardCount(activePlayer.id)
  const inactiveDeckCount = usePlayerDeckCount(inactivePlayer.id)
  const inactiveDiscardCount = usePlayerDiscardCount(inactivePlayer.id)

  const inactiveHand = usePlayerCards(inactivePlayer.id, 'hand')

  return (
    <div
      className="grid h-screen gap-4
        grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]
        grid-rows-[auto_auto_auto_auto_auto] *:border"
      data-testid="duel-view"
    >
      {/* Row 1: inactive discard / hand / deck */}
      <section className="col-1 row-1">
        <FaceDownPile flipped count={inactiveDiscardCount} label="Discard" />
      </section>

      <section className="col-2 row-1 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 px-2 bg-background/30 backdrop-blur-sm rounded shadow-sm">
          {inactivePlayer.name}
        </div>

        <Hand cards={inactiveHand} isActive={false} />
      </section>

      <section className="col-3 row-1">
        <FaceDownPile flipped count={inactiveDeckCount} label="Deck" />
      </section>

      {/* Row 2: inactive board full width */}
      <section className="col-[1/4] row-2">
        <Board cards={inactiveBoard} />
      </section>

      {/* Row 3: center bar */}
      <section className="col-[1/4] row-3 flex justify-between place-items-center">
        <div className="text-lg font-semibold">Phase: {phase}</div>

        <Button
          onClick={() => dispatch({ type: 'SWITCH_TURN' })}
          data-testid="end-turn-button"
        >
          End Turn
        </Button>
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

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 px-2 bg-background/30 backdrop-blur-sm rounded shadow-sm">
          {activePlayer.name}
        </div>
      </section>

      <section className="col-3 row-5">
        <FaceDownPile count={activeDeckCount} label="Deck" />
      </section>
    </div>
  )
}
