export interface CardBackProps {
  className?: string
}

/**
 * CardBack component - displays a card back with diagonal stripe pattern
 * Used for opponent's hand and face-down piles (deck, discard)
 */
export function CardBack({ className = '' }: CardBackProps) {
  return (
    <div
      className={`w-32 h-40 rounded-lg bg-gradient-to-b from-slate-700 to-slate-900 ${className}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(0,0,0,0.3) 0, rgba(0,0,0,0.3) 10px, transparent 10px, transparent 20px)',
      }}
      data-testid="card-back"
    />
  )
}
