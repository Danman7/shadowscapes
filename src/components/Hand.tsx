import { AnimatePresence } from 'motion/react'

import { Card, CardBack } from 'src/components'
import {
  DRAW_STAGGER_SECONDS,
  MotionCardSlot,
  useNewItemIds,
} from 'src/components/animation'
import type { CardInstance } from 'src/game-engine'

export const Hand: React.FC<{
  cards: CardInstance[]
  isActive?: boolean
  isCardLayoutEnabled?: boolean
  isOnTop?: boolean
  onCardClick?: (cardId: string) => (() => void) | undefined
}> = ({
  cards,
  isActive,
  isCardLayoutEnabled = true,
  isOnTop,
  onCardClick,
}) => {
  const cardIds = cards.map((card) => card.id)
  const newCardIds = useNewItemIds(cardIds)
  const newCardOrder = cardIds.filter((cardId) => newCardIds.has(cardId))
  const renderedCards = cards.map((card) => {
    const clickHandler = onCardClick?.(card.id)
    const isClickable = clickHandler !== undefined
    const newCardIndex = newCardOrder.indexOf(card.id)
    const isNew = isCardLayoutEnabled && newCardIndex >= 0

    return (
      <MotionCardSlot
        key={card.id}
        cardId={card.id}
        isLayoutEnabled={isCardLayoutEnabled}
        isNew={isNew}
        enterDelay={isNew ? newCardIndex * DRAW_STAGGER_SECONDS : 0}
        testId="hand-card"
        className={`duration-200 ease-out -mx-12 ${isActive ? 'translate-y-4 hover:-translate-y-54 hover:z-40' : 'pointer-events-none -translate-y-6'} ${isClickable ? 'cursor-pointer drop-shadow-[0_0_7px_var(--color-primary)] is-clickable' : ''}`}
      >
        {isActive ? <Card card={card} onClick={clickHandler} /> : <CardBack />}
      </MotionCardSlot>
    )
  })

  return (
    <div
      className={`relative flex w-full justify-center overflow-visible h-24 ${isOnTop ? 'items-end' : 'items-start'}`}
      data-testid="hand"
    >
      {isCardLayoutEnabled ? (
        <AnimatePresence initial={false}>{renderedCards}</AnimatePresence>
      ) : (
        renderedCards
      )}
    </div>
  )
}
