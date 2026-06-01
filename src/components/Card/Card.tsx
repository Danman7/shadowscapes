import { motion, useAnimationControls } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { GiFlowerStar } from 'react-icons/gi'

import {
  CARD_SHELL_ANIMATIONS,
  type CardFeedbackSnapshot,
  getCardFeedbackEvents,
} from 'src/components/animation'
import { CardAttributesDetails } from 'src/components/Card/CardAttributesDetails'
import { CardAttributesFooter } from 'src/components/Card/CardAttributesFooter'
import type { CardInstance } from 'src/game-engine'
import { FACTION_BORDER_COLORS } from 'src/game-engine'
import { messages } from 'src/i18n'

export const Card: React.FC<{
  card: CardInstance
  isOnBoard?: boolean
  onClick?: () => void
  isClickable?: boolean
  isAttacking?: boolean
  attackDirection?: 'up' | 'down'
}> = ({
  card,
  isOnBoard,
  onClick,
  isClickable,
  isAttacking,
  attackDirection,
}) => {
  const { base, attributes, didAct } = card
  const { name, faction, categories, type, text, isElite } = base
  const { description, flavor } = text
  const { charges, life, isStunned, isHidden } = attributes
  const factionBorderColor = FACTION_BORDER_COLORS[faction]
  const shellControls = useAnimationControls()
  const [chargeAnimationKey, setChargeAnimationKey] = useState(0)
  const previousFeedbackSnapshotRef = useRef<CardFeedbackSnapshot>({
    cardId: card.id,
    charges,
    life,
  })

  useEffect(() => {
    const previousSnapshot = previousFeedbackSnapshotRef.current
    const currentSnapshot = {
      cardId: card.id,
      charges,
      life,
    }
    const { chargesChanged, shellFeedback } = getCardFeedbackEvents(
      previousSnapshot,
      currentSnapshot,
    )

    previousFeedbackSnapshotRef.current = currentSnapshot

    if (chargesChanged) {
      setChargeAnimationKey((currentKey) => currentKey + 1)
    }

    if (shellFeedback === 'damage') {
      void shellControls.start(CARD_SHELL_ANIMATIONS.damage)
    }

    if (shellFeedback === 'life-boost') {
      void shellControls.start(CARD_SHELL_ANIMATIONS.lifeBoost)
    }
  }, [card.id, charges, life, shellControls])

  useEffect(() => {
    if (!isAttacking) return

    void shellControls.start(
      attackDirection === 'down'
        ? CARD_SHELL_ANIMATIONS.attackDown
        : CARD_SHELL_ANIMATIONS.attackUp,
    )
  }, [attackDirection, isAttacking, shellControls])

  return (
    <motion.div animate={shellControls}>
      <div
        className={`card flex flex-col ${factionBorderColor} border-8 ${isOnBoard ? 'w-auto h-auto' : ''} ${isClickable ? 'cursor-pointer hover:shadow-lg' : ''} ${isStunned || isHidden ? 'opacity-70' : ''} ${didAct ? 'rotate-90 opacity-50' : ''}`}
        style={
          isClickable
            ? { filter: 'drop-shadow(0 0 8px var(--color-primary))' }
            : undefined
        }
        onClick={onClick}
        data-testid="card"
      >
        <div className="flex justify-between items-start pb-1">
          <div>
            <div className="flavor" data-testid="card-categories">
              {categories.join(' ')}
            </div>

            <div className="font-bold" data-testid="card-name">
              {name}
            </div>
          </div>

          <div
            className={`badge text-lg font-bold ${isElite ? 'outline-2 outline-gold' : ''}`}
          >
            {type === 'Character' && life !== undefined ? (
              <>{life}</>
            ) : (
              <GiFlowerStar />
            )}
          </div>
        </div>

        {!isOnBoard && (
          <div className="grow overflow-y-auto space-y-2 py-1">
            <p data-testid="card-description">{description}</p>

            <p className="flavor">{flavor}</p>

            <div className="text-sm space-y-2">
              <p>
                <strong>{type}: </strong>
                {type === 'Character'
                  ? messages.ui.characterDescription
                  : messages.ui.instantDescription}
              </p>

              <CardAttributesDetails attributes={attributes} />
            </div>
          </div>
        )}

        <CardAttributesFooter
          attributes={attributes}
          chargeAnimationKey={chargeAnimationKey}
          type={type}
        />
      </div>
    </motion.div>
  )
}
