import { Card } from '@/components/Card'
import { CardBack } from '@/components/CardBack'
import type { CARD_BASES } from '@/constants/cardBases'
import type { CardBaseId, CardInstance } from '@/types'

export interface HandProps {
  cards: Array<CardInstance & { base: (typeof CARD_BASES)[CardBaseId] }>
  isActive: boolean
  onCardClick?: (cardId: number) => void
}

/**
 * Hand component - displays a player's hand
 * Shows actual cards for active player, card backs for inactive player
 */
export function Hand({ cards, isActive, onCardClick }: HandProps) {
  return (
    <div className="flex gap-2 flex-wrap justify-center p-4" data-testid="hand">
      {isActive
        ? cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => onCardClick?.(card.id)}
            />
          ))
        : cards.map((_, index) => <CardBack key={index} />)}

      {cards.length === 0 && (
        <div className="text-gray-400 italic" data-testid="hand-empty">
          Empty Hand
        </div>
      )}
    </div>
  )
}
