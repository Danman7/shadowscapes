import { Card } from '@/components/Card'
import type { CARD_BASES } from '@/constants/cardBases'
import type { CardBaseId, CardInstance } from '@/types'

export interface BoardProps {
  cards: Array<CardInstance & { base: (typeof CARD_BASES)[CardBaseId] }>
}

/**
 * Board component - displays cards currently on the battlefield
 */
export function Board({ cards }: BoardProps) {
  return (
    <div className="flex gap-2 justify-center" data-testid="board">
      {cards.map((card) => (
        <Card isOnBoard key={card.id} card={card} />
      ))}
    </div>
  )
}
