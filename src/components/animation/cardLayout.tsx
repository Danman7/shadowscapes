import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'

import {
  CARD_LAYOUT_TRANSITION,
  CARD_SLOT_VARIANTS,
} from 'src/components/animation/constants'

export const getCardLayoutId = (cardId: string): string => `card-${cardId}`

export const MotionCardSlot: React.FC<{
  cardId: string
  children: ReactNode
  className?: string
  enterDelay?: number
  isLayoutEnabled?: boolean
  isNew?: boolean
  style?: CSSProperties
  testId?: string
}> = ({
  cardId,
  children,
  className,
  enterDelay = 0,
  isLayoutEnabled = true,
  isNew,
  style,
  testId,
}) => (
  <motion.div
    layout={isLayoutEnabled}
    layoutId={isLayoutEnabled ? getCardLayoutId(cardId) : undefined}
    variants={isLayoutEnabled ? CARD_SLOT_VARIANTS : undefined}
    initial={isLayoutEnabled && isNew ? 'initial' : false}
    animate={isLayoutEnabled ? 'animate' : undefined}
    exit={isLayoutEnabled ? 'exit' : undefined}
    transition={
      isLayoutEnabled
        ? {
            ...CARD_LAYOUT_TRANSITION,
            delay: enterDelay,
          }
        : undefined
    }
    className={className}
    style={style}
    data-testid={testId}
  >
    {children}
  </motion.div>
)
