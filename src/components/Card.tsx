import { BsLightningFill } from 'react-icons/bs'

import type { CARD_BASES } from '@/constants/cardBases'
import type { CardBaseId, CardInstance, Faction } from '@/types'

export interface CardProps {
  card: CardInstance & { base: (typeof CARD_BASES)[CardBaseId] }
  onClick?: () => void
  className?: string
}

const FACTION_COLORS: Record<Faction, string> = {
  chaos: 'bg-chaos',
  order: 'bg-order',
  shadow: 'bg-shadow',
  neutral: 'bg-foreground-dim',
}

/**
 * Card component - displays a game card with its details.
 * Shows character strength for character cards or instant indicator for instant cards
 */
export function Card({ card, onClick, className = '' }: CardProps) {
  const { base, strength, type } = card
  const { name, description, flavorText, faction, cost, categories, rank } =
    base
  const factionColor = FACTION_COLORS[faction]

  return (
    <div
      className={`aspect-25/35 max-w-60 w-full h-full flex flex-col rounded-lg border ${rank === 'elite' ? 'border-elite/20' : 'border-foreground/20'} bg-surface p-2 shadow-xs space-y-2 overflow-hidden ${className}`}
      onClick={onClick}
      data-testid="card"
    >
      <div className="font-semibold text-surface rounded overflow-hidden">
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
          className={`text-sm text-center text-surface ${rank === 'elite' ? 'bg-elite' : 'bg-foreground-dim'}`}
        >
          {categories.join(' ')}
        </div>
      </div>

      <div className="flex flex-col justify-around grow">
        <div className="overflow-hidden">
          {description.map((paragraph, index) => (
            <p key={index} className="mb-1">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="text-sm text-foreground-dim font-light italic">
          {flavorText}
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div className="w-5 h-5 rounded-full bg-yellow-300 border border-elite flex items-center justify-center">
          {cost}
        </div>
      </div>
    </div>
  )
}
