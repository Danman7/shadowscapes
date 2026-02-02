import { Card } from '@/components/Card'
import type { CardInstance } from '@/types'

export interface BoardProps {
  cards: CardInstance[]
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
