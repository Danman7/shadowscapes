import { CardBack } from '../../../cards'
import { messages } from '../../../l10n/en'
import {
  useActTurnCompletion,
  useDuelState,
  usePlayTurnCompletion,
  usePlayersDraw,
  usePlayersInitialDraw,
  useRefreshCompletion,
} from '../../hooks'
import { CardInstance } from './CardInstance'
import { CombatInteractionProvider } from './CombatInteractionProvider'
import { FaceDownStack } from './FaceDownStack'
import { PhaseButton } from './PhaseButton'
import { PlayerBadge } from './PlayerBadge'

export const DuelTable = () => (
  <CombatInteractionProvider>
    <DuelTableContent />
  </CombatInteractionProvider>
)

const DuelTableContent = () => {
  usePlayersInitialDraw()
  usePlayersDraw()
  usePlayTurnCompletion()
  useActTurnCompletion()
  useRefreshCompletion()

  const duelState = useDuelState()
  const { actPlayerId, cards, phase, playerOrder, players, round } = duelState
  const activePlayer = players[playerOrder[0]]
  const inactivePlayer = players[playerOrder[1]]
  const isActPhase = phase === 'act'

  return (
    <div
      className="grid relative h-screen gap-2
        grid-cols-[100px_minmax(0,2fr)_100px]
        grid-rows-[140px_1fr_50px_1fr_140px] overflow-hidden"
      data-testid="duel-table"
    >
      <PlayerBadge
        player={inactivePlayer}
        isActive={isActPhase && actPlayerId === inactivePlayer.id}
        className="absolute top-2 left-1/2 -translate-x-1/2"
      />
      {/* Row 1: inactive discard / hand / deck */}
      <section
        className="col-1 row-1 grid place-items-center"
        data-testid="inactive-discard"
      >
        {inactivePlayer.discard.length > 0 && (
          <FaceDownStack
            label={messages.ui.discardLabel}
            amount={inactivePlayer.discard.length}
          />
        )}
      </section>

      <section
        className="player-hand player-hand--inactive col-2 row-1"
        data-testid="inactive-hand"
      >
        {inactivePlayer.hand.map((cardId) => (
          <CardBack key={cardId} />
        ))}
      </section>

      <section
        className="col-3 row-1 grid place-items-center"
        data-testid="inactive-deck"
      >
        {inactivePlayer.deck.length > 0 && (
          <FaceDownStack
            label={messages.ui.deckLabel}
            amount={inactivePlayer.deck.length}
          />
        )}
      </section>

      {/* Row 2: inactive board full width */}
      <section
        className="col-[1/4] row-2 justify-center items-end flex gap-2"
        data-testid="inactive-board"
      >
        {inactivePlayer.board.map((cardId) => (
          <CardInstance key={cardId} instance={cards[cardId]} />
        ))}
      </section>

      {/* Row 3: center bar, UI and buttons */}
      <section className="col-[1/4] w-full px-2 row-3 flex justify-between place-items-center">
        <p className="text-sm font-bold tracking-wide" aria-live="polite">
          Round {round + 1}: {messages.phase[phase]}
        </p>

        <PhaseButton />
      </section>

      {/* Row 4: active board full width */}
      <section
        className="col-[1/4] row-4 flex justify-center gap-2"
        data-testid="active-board"
      >
        {activePlayer.board.map((cardId) => (
          <CardInstance key={cardId} instance={cards[cardId]} />
        ))}
      </section>

      {/* Row 5: active discard / hand / deck */}
      <section
        className="col-1 row-5 grid place-items-center"
        data-testid="active-discard"
      >
        {activePlayer.discard.length > 0 && (
          <FaceDownStack
            label={messages.ui.discardLabel}
            amount={activePlayer.discard.length}
          />
        )}
      </section>

      <section
        className="player-hand player-hand--active col-2 row-5"
        data-testid="active-hand"
      >
        {activePlayer.hand.map((cardId) => (
          <CardInstance key={cardId} instance={cards[cardId]} />
        ))}
      </section>

      <section
        className="col-3 row-5 grid place-items-center"
        data-testid="active-deck"
      >
        {activePlayer.deck.length > 0 && (
          <FaceDownStack
            label={messages.ui.deckLabel}
            amount={activePlayer.deck.length}
          />
        )}
      </section>

      <PlayerBadge
        player={activePlayer}
        isActive={!isActPhase || actPlayerId === activePlayer.id}
        className="absolute bottom-2 left-1/2 -translate-x-1/2"
      />
    </div>
  )
}
