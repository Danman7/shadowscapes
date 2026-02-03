import { BsLightningFill } from 'react-icons/bs'
import { IoHourglassOutline } from 'react-icons/io5'

import { CARD_BASES } from '@/constants/cardBases'
import { FACTION_COLORS } from '@/constants/duelParams'
import type { CardInstance } from '@/types'

export const Card: React.FC<{
  card: CardInstance
  isOnBoard?: boolean
  onClick?: () => void
}> = ({ card, isOnBoard, onClick }) => {
  const { strength, baseId, counter } = card
  const base = CARD_BASES[baseId]
  const {
    name,
    description,
    flavorText,
    faction,
    cost,
    categories,
    rank,
    type,
  } = base
  const factionColor = FACTION_COLORS[faction]

  return (
    <div
      className={`card flex flex-col  ${rank === 'elite' ? 'border-primary/20' : 'border-foreground/20'} ${isOnBoard && 'aspect-auto w-60'} bg-surface p-2 space-y-2`}
      onClick={onClick}
      data-testid="card"
    >
      <div className="font-semibold text-background rounded overflow-hidden">
        <div
          className={`flex justify-between items-center p-2 ${factionColor}`}
          data-testid="card-header"
        >
          <div>{name}</div>

          {type === 'character' && strength !== undefined ? (
            <div>{strength}</div>
          ) : (
            <BsLightningFill />
          )}
        </div>

        <div
          className={`text-sm text-center text-background ${rank === 'elite' ? 'bg-primary' : 'bg-foreground'}`}
        >
          {categories.join(' ')}
        </div>
      </div>

      {isOnBoard && (
        <div className="text-sm">
          {description.map((paragraph, index) => (
            <p key={index} className="mb-1">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {!isOnBoard && (
        <>
          <div className="flex flex-col justify-around grow overflow-y-auto">
            <div>
              {description.map((paragraph, index) => (
                <p key={index} className="mb-1">
                  {paragraph}
                </p>
              ))}
            </div>

            <hr className="border-foreground/10" />

            <div className="text-sm font-light italic">{flavorText}</div>
          </div>

          <hr className="border-foreground/10" />

          <div className="flex justify-between items-end">
            <div className="w-5 h-5 rounded-full bg-primary text-background border-2 border-foreground/20 flex items-center justify-center shadow-xs">
              {cost}
            </div>

            {counter !== undefined && (
              <div className="flex items-center space-x-1">
                <IoHourglassOutline /> {counter}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
