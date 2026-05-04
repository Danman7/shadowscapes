import { PiArrowsClockwiseFill } from 'react-icons/pi'

import { CardAttributesDetails } from 'src/components/CardAttributesDetails'
import { CardAttributesFooter } from 'src/components/CardAttributesFooter'
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
  const { base, attributes } = card
  const { name, faction, categories, type, text, isElite } = base
  const { description, flavor } = text
  const { life, isStunned, isHidden } = attributes
  const factionBorderColor = FACTION_BORDER_COLORS[faction]

  const attackClassName =
    isAttacking && attackDirection === 'down'
      ? 'card-attack-down'
      : isAttacking
        ? 'card-attack-up'
        : ''

  return (
    <div
      className={`card flex flex-col ${factionBorderColor} border-8 ${isOnBoard ? 'h-auto' : ''} ${isClickable && 'cursor-pointer'} ${attackClassName} ${isStunned || isHidden ? 'opacity-70' : ''}`}
      style={
        isClickable
          ? { filter: 'drop-shadow(0 0 8px var(--color-primary))' }
          : undefined
      }
      onClick={onClick}
      data-testid="card"
    >
      <div className="flex justify-between items-start">
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
            <PiArrowsClockwiseFill />
          )}
        </div>
      </div>

      {!isOnBoard && (
        <div className="grow overflow-y-auto space-y-2">
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

      <CardAttributesFooter attributes={attributes} type={type} />
    </div>
  )
}
