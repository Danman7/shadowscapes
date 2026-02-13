import { Card } from '@/components/Card'
import type { CardInstance } from '@/types'

export const Board: React.FC<{
  cards: CardInstance[]
  onCardClick?: (cardId: number) => (() => void) | undefined
}> = ({ cards, onCardClick }) => (
  <div className="flex gap-2 justify-center" data-testid="board">
    {cards.map((card) => {
      const clickHandler = onCardClick?.(card.id)
      return (
        <Card
          isOnBoard
          key={card.id}
          card={card}
          onClick={clickHandler}
          isClickable={clickHandler !== undefined}
        />
      )
    })}
  </div>
)
