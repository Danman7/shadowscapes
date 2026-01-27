import { Card } from '@/components/Card'
import type { CARD_BASES } from '@/constants/cardBases'
import type { CardBaseId, CardInstance } from '@/types'

export interface BoardProps {
  cards: Array<CardInstance & { base: (typeof CARD_BASES)[CardBaseId] }>
  playerName?: string
}

/**
 * Board component - displays cards currently on the battlefield
 */
export function Board({ cards, playerName }: BoardProps) {
  return (
    <div className="flex flex-col gap-2 p-4" data-testid="board">
      {playerName && (
        <div className="text-lg font-bold text-gray-700">
          {playerName}
          {"'"}s Board
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}

        {cards.length === 0 && (
          <div className="text-gray-400 italic" data-testid="board-empty">
            No cards on board
          </div>
        )}
      </div>
    </div>
  )
}
