import { AnimatePresence } from 'motion/react'

import { Card } from 'src/components'
import { MotionCardSlot } from 'src/components/animation'
import type { CardInstance } from 'src/game-engine'

export const Board: React.FC<{
  cards: CardInstance[]
  isCardLayoutEnabled?: boolean
  isTopBoard?: boolean
  attackingCardId?: string | null
  onCardClick?: (cardId: string) => (() => void) | undefined
}> = ({
  cards,
  isCardLayoutEnabled = true,
  isTopBoard,
  attackingCardId,
  onCardClick,
}) => {
  const renderedCards = cards.map((card) => {
    const clickHandler = onCardClick?.(card.id)

    return (
      <MotionCardSlot
        key={card.id}
        cardId={card.id}
        isLayoutEnabled={isCardLayoutEnabled}
        isNew={isCardLayoutEnabled}
      >
        <Card
          isOnBoard
          card={card}
          onClick={clickHandler}
          isClickable={clickHandler !== undefined}
          isAttacking={attackingCardId === card.id}
          attackDirection={isTopBoard ? 'down' : 'up'}
        />
      </MotionCardSlot>
    )
  })

  return (
    <div className="flex gap-2 justify-center" data-testid="board">
      {isCardLayoutEnabled ? (
        <AnimatePresence initial={false}>{renderedCards}</AnimatePresence>
      ) : (
        renderedCards
      )}
    </div>
  )
}
