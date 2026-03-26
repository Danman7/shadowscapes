import { BsLightningFill } from 'react-icons/bs'
import { FaSun } from 'react-icons/fa'
import { FaHandFist } from 'react-icons/fa6'
import { GiStarSwirl, GiWingfoot } from 'react-icons/gi'

import {
  FACTION_BORDER_COLORS,
  FACTION_TEXT_COLORS,
} from 'src/game-engine/constants/duelParams'
import type { CardInstance } from 'src/game-engine/types'

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
  const { name, faction, categories, type, text } = base
  const { description } = text
  const { life, strength, charges, cost, stunned, haste } = attributes
  const factionBorderColor = FACTION_BORDER_COLORS[faction]

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
          <div className={`card-circle -ml-2 -mt-2 ${factionBorderColor}`}>
            {type === 'instant' ? <FaSun /> : <>{life}</>}
          </div>

          {type === 'character' && (
            <div className="flex items-center text-lg pl-1 pt-1 gap-1 font-bold">
              {stunned ? (
                <GiStarSwirl />
              ) : (
                <>
                  <FaHandFist /> {strength}
                </>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="text-right pr-2">
            <div className="text-sm font-light">{categories.join(' ')}</div>

            <div
              className={`text-2xl font-bold ${FACTION_TEXT_COLORS[faction]}`}
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

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 pl-2 text-xl">
          {charges !== undefined && (
            <div className="flex items-center gap-1">
              <BsLightningFill /> {charges}
            </div>
          )}

          {haste && <GiWingfoot />}
        </div>
        <div
          className={`card-circle bg-gold -mr-2 -mb-2 ${factionBorderColor}`}
        >
          <div className="text-gold-dark text-shadow-md">{cost}</div>
        </div>
      </div>

      {/* <div
        className={`flex justify-between items-end ${isOnBoard ? 'text-sm' : ''}`}
      >
       

        

        

       

        
      </div> */}
    </div>
  )
}
