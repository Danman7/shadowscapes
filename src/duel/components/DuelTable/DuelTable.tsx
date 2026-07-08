import { CardBack } from '../../../cards'
import { messages } from '../../../l10n/en'
import {
  useActTurnCompletion,
  useDuelState,
  usePlayTurnCompletion,
  usePlayersDraw,
  usePlayersInitialDraw,
  useRandomAiController,
  useRefreshCompletion,
} from '../../hooks'
import { getTablePlayerIds } from '../../utils'
import { CardInstance } from './CardInstance'
import { BookOfAshTargetModal } from './BookOfAshTargetModal'
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
  useRandomAiController()
  usePlayTurnCompletion()
  useActTurnCompletion()
  useRefreshCompletion()

  const duelState = useDuelState()
  const { actPlayerId, cards, phase, playerOrder, players, round } = duelState
  const { bottomPlayerId, topPlayerId } = getTablePlayerIds(duelState)
  const bottomPlayer = players[bottomPlayerId]
  const topPlayer = players[topPlayerId]
  const isActPhase = phase === 'act'
  const isPlayerTakingTurn = (playerId: string) =>
    isActPhase ? actPlayerId === playerId : playerOrder[0] === playerId

  return (
    <div
      className="grid relative h-screen gap-2
        grid-cols-[100px_minmax(0,2fr)_100px]
        grid-rows-[120px_1fr_50px_1fr_120px] overflow-hidden"
      data-testid="duel-table"
    >
      <PlayerBadge
        player={topPlayer}
        isActive={isPlayerTakingTurn(topPlayer.id)}
        className="absolute top-2 left-1/2 -translate-x-1/2"
      />
      {/* Row 1: inactive discard / hand / deck */}
      <section
        className="col-1 row-1 grid place-items-center"
        data-testid="inactive-discard"
      >
        {topPlayer.discard.length > 0 && (
          <FaceDownStack
            label={messages.ui.discardLabel}
            amount={topPlayer.discard.length}
          />
        )}
      </section>

      <section
        className="player-hand player-hand--inactive col-2 row-1"
        data-testid="inactive-hand"
      >
        {topPlayer.hand.map((cardId) => (
          <CardBack key={cardId} />
        ))}
      </section>

      <section
        className="col-3 row-1 grid place-items-center"
        data-testid="inactive-deck"
      >
        {topPlayer.deck.length > 0 && (
          <FaceDownStack
            label={messages.ui.deckLabel}
            amount={topPlayer.deck.length}
          />
        )}
      </section>

      {/* Row 2: inactive board full width */}
      <section
        className="col-[1/4] row-2 justify-center items-end flex gap-2"
        data-testid="inactive-board"
      >
        {topPlayer.board.map((cardId) => (
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
        {bottomPlayer.board.map((cardId) => (
          <CardInstance key={cardId} instance={cards[cardId]} />
        ))}
      </section>

      {/* Row 5: active discard / hand / deck */}
      <section
        className="col-1 row-5 grid place-items-center"
        data-testid="active-discard"
      >
        {bottomPlayer.discard.length > 0 && (
          <FaceDownStack
            label={messages.ui.discardLabel}
            amount={bottomPlayer.discard.length}
          />
        )}
      </section>

      <section
        className="player-hand player-hand--active col-2 row-5"
        data-testid="active-hand"
      >
        {bottomPlayer.hand.map((cardId) => (
          <CardInstance key={cardId} instance={cards[cardId]} />
        ))}
      </section>

      <section
        className="col-3 row-5 grid place-items-center"
        data-testid="active-deck"
      >
        {bottomPlayer.deck.length > 0 && (
          <FaceDownStack
            label={messages.ui.deckLabel}
            amount={bottomPlayer.deck.length}
          />
        )}
      </section>

      <PlayerBadge
        player={bottomPlayer}
        isActive={isPlayerTakingTurn(bottomPlayer.id)}
        className="absolute bottom-2 left-1/2 -translate-x-1/2"
      />

      <BookOfAshTargetModal />
    </div>
  )
}
