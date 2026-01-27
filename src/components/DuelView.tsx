import { Board } from '@/components/Board'
import { DeckPile } from '@/components/DeckPile'
import { DiscardPile } from '@/components/DiscardPile'
import { Hand } from '@/components/Hand'
import { IntroScreen } from '@/components/IntroScreen'
import { useGameDispatch, useGameState } from '@/contexts/GameContext'
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
import { DEFAULT_DUEL_SETUP } from '@/test/mocks/duelSetup'

/**
 * DuelView component - main game view that orchestrates all game components
 * Renders different views based on game phase
 * Active player always displayed at bottom, inactive player at top
 */
export function DuelView() {
  const duel = useGameState()
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

  if (duel.startingPlayerId === null) {
    return (
      <IntroScreen
        onContinue={() => {
          dispatch({
            type: 'START_DUEL',
            payload: {
              ...DEFAULT_DUEL_SETUP,
              player1Name:
                duel.players.player1.name || DEFAULT_DUEL_SETUP.player1Name,
              player2Name:
                duel.players.player2.name || DEFAULT_DUEL_SETUP.player2Name,
            },
          })
        }}
      />
    )
  }

  if (phase === 'intro') {
    return (
      <IntroScreen
        onContinue={() => {
          dispatch({ type: 'TRANSITION_PHASE', payload: 'initial-draw' })
        }}
      />
    )
  }

  return (
    <div
      className="w-full h-screen bg-linear-to-b from-slate-100 to-slate-200 flex flex-col"
      data-testid="duel-view"
    >
      {/* Inactive Player Section (Top) */}
      <div className="flex-1 border-b-2 border-gray-400 p-4 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{inactivePlayer.name}</h3>
          <div className="flex gap-4">
            <DeckPile count={inactiveDeckCount} label="Deck" />
            <DiscardPile count={inactiveDiscardCount} label="Discard" />
          </div>
        </div>

        <Hand cards={inactiveHand} isActive={false} />

        <Board cards={inactiveBoard} playerName={inactivePlayer.name} />
      </div>

      {/* Game Info */}
      <div className="bg-slate-400 border-t-2 border-b-2 border-gray-400 p-4 flex justify-between items-center">
        <div className="text-lg font-semibold">Phase: {phase}</div>

        <button
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
          onClick={() => dispatch({ type: 'SWITCH_TURN' })}
          data-testid="end-turn-button"
        >
          End Turn
        </button>
      </div>

      {/* Active Player Section (Bottom) */}
      <div className="flex-1 p-4 flex flex-col-reverse">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{activePlayer.name}</h3>
          <div className="flex gap-4">
            <DeckPile count={activeDeckCount} label="Deck" />
            <DiscardPile count={activeDiscardCount} label="Discard" />
          </div>
        </div>

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

        <Board cards={activeBoard} playerName={activePlayer.name} />
      </div>
    </div>
  )
}
