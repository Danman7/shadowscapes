import { BsLightningFill } from 'react-icons/bs'
import { FaSun } from 'react-icons/fa'
import { FaHandFist } from 'react-icons/fa6'
import { GiCrownCoin, GiStarSwirl, GiWingfoot } from 'react-icons/gi'

import { AnimatedNumber } from 'src/components/AnimatedNumber'
import { CARD_BASES } from 'src/constants/cardBases'
import { FACTION_COLORS } from 'src/constants/duelParams'
import type { CardInstance } from 'src/types'

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
  const { life, strength, baseId, charges, cost, stunned, haste } = card
  const base = CARD_BASES[baseId]
  const { name, description, flavorText, faction, categories, rank, type } =
    base
  const factionColor = FACTION_COLORS[faction]

  const attackClassName =
    isAttacking && attackDirection === 'down'
      ? 'card-attack-down'
      : isAttacking
        ? 'card-attack-up'
        : ''

  return (
    <div
      className={`card flex flex-col ${rank === 'elite' ? 'border-primary/20' : 'border-foreground/20'} ${isOnBoard && 'aspect-auto w-60'} ${isClickable && 'cursor-pointer'} ${attackClassName} bg-surface p-2 space-y-2 ${stunned && 'opacity-80'}`}
      style={
        isClickable
          ? { filter: 'drop-shadow(0 0 8px var(--color-primary))' }
          : undefined
      }
      onClick={onClick}
      data-testid="card"
    >
      <div className="font-semibold text-background">
        <div
          className={`flex justify-between rounded-t items-center p-2 ${factionColor}`}
          data-testid="card-header"
        >
          <div>{name}</div>

          {type === 'character' && life !== undefined ? (
            <AnimatedNumber value={life} />
          ) : (
            <FaSun />
          )}
        </div>

        <div
          className={`text-sm text-center text-background rounded-b ${rank === 'elite' ? 'bg-primary' : 'bg-foreground'}`}
        >
          {categories.join(' ')}
        </div>
      </div>

      <div
        className={`flex flex-col justify-around grow text-center overflow-y-auto ${isOnBoard ? 'text-sm' : ''}`}
      >
        <div>
          {description.map((paragraph, index) => (
            <p key={index} className={isOnBoard ? '' : 'mb-2'}>
              {paragraph}
            </p>
          ))}
        </div>

        {!isOnBoard && (
          <>
            <hr className="border-foreground/10" />

            <div className="text-sm font-light italic">{flavorText}</div>
          </>
        )}
      </div>

      {!isOnBoard && <hr className="border-foreground/10" />}

      <div
        className={`flex justify-between items-end ${isOnBoard ? 'text-sm' : ''}`}
      >
        <div className="flex items-center gap-1 text-primary">
          <GiCrownCoin /> {cost}
        </div>

        {stunned && <GiStarSwirl />}

        {haste && <GiWingfoot />}

        {charges !== undefined && (
          <div className="flex items-center gap-1">
            <BsLightningFill /> {charges}
          </div>
        )}

        {strength !== undefined && (
          <div className="flex items-center gap-1">
            <FaHandFist /> {strength}
          </div>
        )}
      </div>
    </div>
  )
}
