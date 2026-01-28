export interface CardBackProps {
  isSmall?: boolean
}

/**
 * CardBack component - displays a card back with diagonal stripe pattern
 * Used for opponent's hand and face-down piles (deck, discard)
 */
export function CardBack({ isSmall = false }: CardBackProps) {
  return (
    <div
      className={`card ${isSmall ? 'w-30' : 'w-60'} border-foreground-dim`}
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, var(--color-foreground-dim) 0, var(--color-foreground-dim) ${isSmall ? '5px' : '10px'}, var(--color-surface) ${isSmall ? '5px' : '10px'}, var(--color-surface) ${isSmall ? '10px' : '20px'})`,
      }}
      data-testid="card-back"
    />
  )
}
