import { BsLightningFill } from 'react-icons/bs'
import { FaSun } from 'react-icons/fa'
import { FaHandFist } from 'react-icons/fa6'
import { GiStarSwirl, GiWingfoot } from 'react-icons/gi'

import type { CardInstance } from 'src/game-engine'
import {
  FACTION_BACKGROUND_COLORS,
  FACTION_BORDER_COLORS,
} from 'src/game-engine'

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
  const { name, faction, categories, type, text, rank } = base
  const { description } = text
  const { life, strength, charges, cost, stunned, haste } = attributes
  const factionBorderColor = FACTION_BORDER_COLORS[faction]
  const factionBackgroundColor = FACTION_BACKGROUND_COLORS[faction]

  const attackClassName =
    isAttacking && attackDirection === 'down'
      ? 'card-attack-down'
      : isAttacking
        ? 'card-attack-up'
        : ''

  return (
    <div
      className={`card flex flex-col ${factionBorderColor} border-8 ${isOnBoard && 'aspect-auto w-60'} ${isClickable && 'cursor-pointer'} ${attackClassName} ${stunned && 'opacity-70'}`}
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
          <div
            className={`badge h-12 w-12 rounded-tl-xl font-bold text-xl -ml-2 -mt-2 ${factionBackgroundColor}`}
          >
            {type === 'instant' ? <FaSun /> : <>{life}</>}
          </div>
        </div>

        <div>
          <div className="text-right pr-2">
            <div className="flavor-text">{categories.join(' ')}</div>

            <div
              className={`font-bold text-lg ${rank === 'elite' ? 'text-gold-text' : ''}`}
            >
              {name}
            </div>
          </div>
        </div>
      </div>

      {!isOnBoard && (
        <div
          className={
            'flex flex-col grow justify-around p-4 text-center overflow-y-auto $'
          }
        >
          {description.map((paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center p-2">
        <div className="flex items-center gap-2 ">
          {type === 'character' && (
            <div>
              {stunned ? (
                <div className={`badge ${factionBackgroundColor}`}>
                  <GiStarSwirl />
                </div>
              ) : (
                <div className={`badge ${factionBackgroundColor}`}>
                  <FaHandFist /> {strength}
                </div>
              )}
            </div>
          )}

          {charges !== undefined && (
            <div className={`badge ${factionBackgroundColor}`}>
              <BsLightningFill /> {charges}
            </div>
          )}

          {haste && <GiWingfoot />}
        </div>

        <div className="coin">{cost}</div>
      </div>

      {/* <div
        className={`flex justify-between items-end ${isOnBoard ? 'text-sm' : ''}`}
      >
       

        

        

       

        
      </div> */}
    </div>
  )
}
