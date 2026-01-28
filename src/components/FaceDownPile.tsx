import { CardBack } from '@/components/CardBack'

export interface FaceDownPileProps {
  count: number
  label: string
}

/**
 * FaceDownPile component - displays a pile of facing down cards with count.
 * Shows a single card back with the number of cards remaining
 */
export function FaceDownPile({ count, label }: FaceDownPileProps) {
  return (
    <div
      className="flex flex-col items-center gap-2"
      data-testid="face-down-pile"
    >
      <div className="text-sm font-semibold">{label}</div>

      <div className="relative">
        {count > 0 ? (
          <>
            <CardBack isSmall />

            <div
              className="absolute -top-2 -right-2 bg-surface border border-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
              data-testid="deck-count"
            >
              {count}
            </div>
          </>
        ) : (
          <div className="text-foreground-dim italic text-sm">Empty</div>
        )}
      </div>
    </div>
  )
}
