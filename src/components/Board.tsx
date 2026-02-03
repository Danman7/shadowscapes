import { Card } from '@/components/Card'
import type { CardInstance } from '@/types'

export const Board: React.FC<{
  cards: CardInstance[]
}> = ({ cards }) => (
  <div className="flex gap-2 justify-center" data-testid="board">
    {cards.map((card) => (
      <Card isOnBoard key={card.id} card={card} />
    ))}
  </div>
)
