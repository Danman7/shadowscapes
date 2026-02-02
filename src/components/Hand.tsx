import type { CSSProperties } from 'react'

import { Card } from '@/components/Card'
import { CardBack } from '@/components/CardBack'
import type { CardInstance } from '@/types'

export interface HandProps {
  cards: CardInstance[]
  isActive: boolean
  isOnTop?: boolean
  onCardClick?: (cardId: number) => void
}

/**
 * Hand component - displays a player's hand
 * Shows actual cards for active player, card backs for inactive player
 */
export function Hand({ cards, isActive, isOnTop, onCardClick }: HandProps) {
  const cardCount = cards.length
  const totalSpread = cardCount > 1 ? Math.min(50, (cardCount - 1) * 12) : 0
  const angleStep = cardCount > 1 ? totalSpread / (cardCount - 1) : 0
  const overlap = 36
  const midpoint = (cardCount - 1) / 2
  const rotationDirection = isActive ? 1 : -1

  return (
    <div
      className={`relative flex w-full justify-center overflow-visible h-24 ${isOnTop ? 'items-end' : 'items-start'}`}
      data-testid="hand"
    >
      {cards.map((card, index) => {
        const relativeIndex = index - midpoint
        const rotation =
          rotationDirection * (angleStep * index - totalSpread / 2)
        const xOffset = relativeIndex * overlap

        const style: CSSProperties & Record<string, string | number> = {
          '--card-x': `${xOffset}px`,
          '--card-rotate': `${rotation}deg`,
        }

        return (
          <div
            key={card.id}
            className={`hand-card ${isActive ? 'is-active' : 'is-inactive'}`}
            style={style}
          >
            {isActive ? (
              <Card card={card} onClick={() => onCardClick?.(card.id)} />
            ) : (
              <CardBack />
            )}
          </div>
        )
      })}
    </div>
  )
}
