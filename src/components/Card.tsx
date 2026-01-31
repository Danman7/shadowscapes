import { BsLightningFill } from 'react-icons/bs'

import type { CARD_BASES } from '@/constants/cardBases'
import type { CardBaseId, CardInstance, Faction } from '@/types'

export type GameCard = CardInstance & { base: (typeof CARD_BASES)[CardBaseId] }

export interface CardProps {
  card: GameCard
  isOnBoard?: boolean
  onClick?: () => void
}

const FACTION_COLORS: Record<Faction, string> = {
  chaos: 'bg-chaos',
  order: 'bg-order',
  shadow: 'bg-shadow',
  neutral: 'bg-foreground-fixed',
}

/**
 * Card component - displays a game card with its details.
 * Shows character strength for character cards or instant indicator for instant cards
 */
export function Card({ card, isOnBoard, onClick }: CardProps) {
  const { base, strength, type } = card
  const { name, description, flavorText, faction, cost, categories, rank } =
    base
  const factionColor = FACTION_COLORS[faction]

  return (
    <div
      className={`card flex flex-col  ${rank === 'elite' ? 'border-primary/20' : 'border-foreground/20'} ${isOnBoard && 'aspect-auto w-60'} bg-surface p-2 space-y-2`}
      onClick={onClick}
      data-testid="card"
    >
      <div className="font-semibold text-background-fixed rounded overflow-hidden">
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
          className={`text-sm text-center text-background-fixed ${rank === 'elite' ? 'bg-primary' : 'bg-foreground-fixed'}`}
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

            <div className="text-sm text- font-light italic">{flavorText}</div>
          </div>

          <hr className="border-foreground/10" />

          <div className="flex justify-between items-end">
            <div className="w-5 h-5 rounded-full bg-yellow-300 border border-elite flex items-center justify-center">
              {cost}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
