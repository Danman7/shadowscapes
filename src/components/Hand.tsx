import { Card, CardBack } from 'src/components'
import type { CardInstance } from 'src/game-engine'

export const Hand: React.FC<{
  cards: CardInstance[]
  isActive?: boolean
  isOnTop?: boolean
  onCardClick?: (cardId: string) => (() => void) | undefined
}> = ({ cards, isActive, isOnTop, onCardClick }) => {
  return (
    <div
      className={`relative flex w-full justify-center overflow-visible h-24 ${isOnTop ? 'items-end' : 'items-start'}`}
      data-testid="hand"
    >
      {cards.map((card) => {
        const clickHandler = onCardClick?.(card.id)
        const isClickable = clickHandler !== undefined

        return (
          <div
            key={card.id}
            className={`duration-200 ease-out -mx-10 ${isActive ? 'translate-y-4 hover:-translate-y-54 hover:z-40' : 'pointer-events-none -translate-y-6'} ${isClickable ? 'cursor-pointer drop-shadow-[0_0_7px_var(--color-primary)] is-clickable' : ''}`}
            data-testid="hand-card"
          >
            {isActive ? (
              <Card card={card} onClick={clickHandler} />
            ) : (
              <CardBack />
            )}
          </div>
        )
      })}
    </div>
  )
}
