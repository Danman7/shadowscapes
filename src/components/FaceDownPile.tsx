import { AnimatePresence } from 'motion/react'

import { CardBack } from 'src/components'
import { MotionCardSlot } from 'src/components/animation'
import type { CardInstance } from 'src/game-engine'

const PILE_LAYER_OFFSET_PX = 1.5
const MAX_VISIBLE_LAYER_OFFSET = 5

const getPileLayerOffset = (index: number): number =>
  Math.min(index, MAX_VISIBLE_LAYER_OFFSET) * PILE_LAYER_OFFSET_PX

export const FaceDownPile: React.FC<{
  cards?: CardInstance[]
  count?: number
  label: string
  flipped?: boolean
  isCardLayoutEnabled?: boolean
}> = ({
  cards,
  count: countProp,
  label,
  flipped = false,
  isCardLayoutEnabled = true,
}) => {
  const count = countProp ?? cards?.length ?? 0
  const hasCardAnchors = cards !== undefined && cards.length > 0
  const renderedCards = cards?.map((card, index) => {
    const layerOffset = getPileLayerOffset(index)

    return (
      <MotionCardSlot
        key={card.id}
        cardId={card.id}
        className="absolute left-0 top-0"
        isLayoutEnabled={isCardLayoutEnabled}
        style={{
          zIndex: index,
        }}
      >
        <div
          style={{
            transform: `translate(${layerOffset}px, ${
              flipped ? -layerOffset : layerOffset
            }px)`,
          }}
        >
          <CardBack isSmall />
        </div>
      </MotionCardSlot>
    )
  })

  return (
    count > 0 && (
      <div
        className="flex flex-col items-center gap-2"
        data-testid="face-down-pile"
      >
        {!flipped && <div className="text-sm font-semibold">{label}</div>}

        <div className="relative h-28 w-20">
          {!hasCardAnchors ? (
            <CardBack isSmall />
          ) : !isCardLayoutEnabled ? (
            renderedCards
          ) : (
            <AnimatePresence initial={false}>{renderedCards}</AnimatePresence>
          )}

          <div
            className={`absolute ${flipped ? '-bottom-2' : '-top-2'} -right-2 bg-surface border border-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center`}
            style={{ zIndex: count + 1 }}
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
