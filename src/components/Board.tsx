import { Card } from 'src/components'
import type { CardInstance } from 'src/types'

export const Board: React.FC<{
  cards: CardInstance[]
  isTopBoard?: boolean
  attackingCardId?: number | null
  onCardClick?: (cardId: number) => (() => void) | undefined
}> = ({ cards, isTopBoard, attackingCardId, onCardClick }) => (
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
          isAttacking={attackingCardId === card.id}
          attackDirection={isTopBoard ? 'down' : 'up'}
        />
      )
    })}
  </div>
)
