import { CardBack } from '@/components/CardBack'

export interface DiscardPileProps {
  count: number
  label?: string
}

/**
 * DiscardPile component - displays discard pile with card count
 * Shows a single card back with the number of discarded cards
 */
export function DiscardPile({ count, label = 'Discard' }: DiscardPileProps) {
  return (
    <div
      className="flex flex-col items-center gap-2"
      data-testid="discard-pile"
    >
      {label && (
        <div className="text-sm font-semibold text-gray-700">{label}</div>
      )}

      <div className="relative">
        {count > 0 ? (
          <>
            <CardBack />

            <div
              className="absolute -bottom-2 -right-2 bg-gray-800 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
              data-testid="discard-count"
            >
              {count}
            </div>
          </>
        ) : (
          <div
            className="text-gray-400 italic text-sm"
            data-testid="discard-empty"
          >
            Empty
          </div>
        )}
      </div>
    </div>
  )
}
