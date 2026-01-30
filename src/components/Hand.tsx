import { Card, type GameCard } from '@/components/Card'
import { CardBack } from '@/components/CardBack'

export interface HandProps {
  cards: GameCard[]
  isActive: boolean
  onCardClick?: (cardId: number) => void
}

/**
 * Hand component - displays a player's hand
 * Shows actual cards for active player, card backs for inactive player
 */
export function Hand({ cards, isActive, onCardClick }: HandProps) {
  return (
    <div className="flex gap-2 flex-wrap justify-center" data-testid="hand">
      {isActive
        ? cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => onCardClick?.(card.id)}
            />
          ))
        : cards.map((_, index) => <CardBack key={index} />)}
    </div>
  )
}
