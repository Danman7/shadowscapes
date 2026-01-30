import { CardBack } from '@/components/CardBack'

export interface FaceDownPileProps {
  count: number
  label: string
  flipped?: boolean
}

/**
 * FaceDownPile component - displays a pile of facing down cards with count.
 * Shows a single card back with the number of cards remaining
 */
export function FaceDownPile({
  count,
  label,
  flipped = false,
}: FaceDownPileProps) {
  return (
    count > 0 && (
      <div
        className="flex flex-col items-center gap-2"
        data-testid="face-down-pile"
      >
        {!flipped && <div className="text-sm font-semibold">{label}</div>}

        <div className="relative">
          <CardBack isSmall />

          <div
            className={`absolute ${flipped ? '-bottom-2' : '-top-2'} -right-2 bg-surface border border-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center`}
            data-testid="deck-count"
          >
            {count}
          </div>
        </div>

        {flipped && <div className="text-sm font-semibold">{label}</div>}
      </div>
    )
  )
}
