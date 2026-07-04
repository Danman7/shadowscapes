import { Card, CardBack, getCardBase } from '../../../cards'
import { messages } from '../../../l10n/en'
import {
  useDuelState,
  usePlayersDraw,
  usePlayersInitialDraw,
} from '../../hooks'
import type { CardInstanceId } from '../../types'
import { FaceDownStack } from './FaceDownStack'
import { PlayerBadge } from './PlayerBadge'

export const DuelTable = () => {
  usePlayersInitialDraw()
  usePlayersDraw()

  const { cards, phase, playerOrder, players } = useDuelState()
  const activePlayer = players[playerOrder[0]]
  const inactivePlayer = players[playerOrder[1]]

  const renderFaceUpCards = (cardIds: CardInstanceId[]) =>
    cardIds.map((cardId) => {
      const card = cards[cardId]

      return <Card key={card.id} card={getCardBase(card.baseId)} />
    })

  return (
    <div
      className="grid relative h-screen gap-2
        grid-cols-[100px_minmax(0,2fr)_100px]
        grid-rows-[140px_1fr_50px_1fr_140px] overflow-hidden"
      data-testid="duel-table"
    >
      <PlayerBadge
        player={inactivePlayer}
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
        className="col-[1/4] row-2 justify-center items-end flex gap-2 overflow-hidden"
        data-testid="inactive-board"
      >
        {renderFaceUpCards(inactivePlayer.board)}
      </section>

      {/* Row 3: center bar, UI and buttons */}
      <section className="col-[1/4] w-full px-2 row-3 flex justify-between place-items-center">
        <p className="text-sm font-bold tracking-wide" aria-live="polite">
          {messages.phase[phase]}
        </p>
      </section>

      {/* Row 4: active board full width */}
      <section
        className="col-[1/4] row-4 flex justify-center gap-2 overflow-hidden"
        data-testid="active-board"
      >
        {renderFaceUpCards(activePlayer.board)}
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
        {renderFaceUpCards(activePlayer.hand)}
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
        isActive
        className="absolute bottom-2 left-1/2 -translate-x-1/2"
      />
    </div>
  )
}
