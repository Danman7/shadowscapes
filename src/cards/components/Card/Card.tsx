import { cardsText } from '../../../l10n'
import { joinWithSpace } from '../../../shared/utils'
import {
  factionBorderColorClassNames,
  factionTextColorClassNames,
} from '../../constants'
import type { CardBaseId } from '../../bases'
import type { CardBase } from '../../types'
import { isCharacter } from '../../utils'
import { BsFillLightningChargeFill } from 'react-icons/bs'
import { FaFistRaised } from 'react-icons/fa'
import { GiStarSwirl, GiWingfoot } from 'react-icons/gi'

export type DisplayCard = CardBase<CardBaseId>

export interface CardProps {
  card: DisplayCard
  isCompact?: boolean
  className?: string
  isSelected?: boolean
  onClick?: () => void
}

export const Card = ({
  card,
  isCompact = false,
  className = '',
  isSelected = false,
  onClick,
}: CardProps) => {
  const { categories, faction, baseId } = card

  const cardText = cardsText.cards[baseId]
  const isCardCharacter = isCharacter(card)
  const charges = isCardCharacter ? card.traits?.charges : undefined
  const hasCharges = Boolean(charges)
  const hasHaste = isCardCharacter && Boolean(card.traits?.haste)
  const cost = card.cost
  const life = isCardCharacter ? card.life : undefined
  const strength = isCardCharacter
    ? (card.strength ?? 1)
    : undefined
  const turnsStunned = isCardCharacter ? (card.traits?.stunned ?? 0) : 0
  const isStunned = turnsStunned > 0
  const borderColor = factionBorderColorClassNames[faction]

  const cardElement = (
    <article
      aria-label={`${cardText.name} card`}
      className={`${isCompact ? 'card-compact' : 'card'} flex flex-col gap-2 overflow-hidden border-2 bg-surface p-2 ${borderColor} ${onClick ? 'card-glow card-glow--primary cursor-pointer' : ''} ${isSelected ? 'card-glow card-glow--selected' : ''} ${isStunned ? 'opacity-70' : ''} ${isCompact ? '' : className}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) return

        event.preventDefault()
        onClick()
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick || isCompact ? 0 : undefined}
    >
      {/* Header */}
      <div className="flex shrink-0 justify-between gap-2">
        <div>
          {!isCompact && (
            <div className="capitalize text-sm">
              {joinWithSpace(categories)}
            </div>
          )}

          <h2
            className={`${isCompact ? 'text-sm leading-tight' : ''} font-bold ${factionTextColorClassNames[faction]}`}
          >
            {cardText.name}
          </h2>
        </div>

        {isCardCharacter && (
          <dl>
            <dt className="sr-only">Life</dt>
            <dd className="text-xl font-bold">{life}</dd>
          </dl>
        )}
      </div>

      <hr className={`${borderColor}`} />

      {/* Body */}
      <div
        className={`flex min-h-0 flex-1 flex-col gap-2 leading-snug ${isCompact ? 'overflow-hidden text-sm' : 'overflow-y-auto'}`}
      >
        <p className={isCompact ? 'line-clamp-4' : undefined}>
          {cardText.description}
        </p>

        {!isCompact && (
          <p className="text-sm italic text-foreground/80">{cardText.flavor}</p>
        )}
      </div>

      <hr className={`${borderColor}`} />

      {/* Footer */}
      <dl className="flex shrink-0 gap-2 items-center">
        <dt className="sr-only">Cost</dt>
        <dd className="coin">{cost}</dd>

        {isCardCharacter && (
          <>
            <dt className="sr-only">Strength</dt>
            <dd className="flex items-center">
              <FaFistRaised /> {strength}
            </dd>
          </>
        )}

        {hasCharges && (
          <>
            <dt className="sr-only">Charges</dt>
            <dd className="flex items-center">
              <BsFillLightningChargeFill /> {charges}
            </dd>
          </>
        )}

        {hasHaste && (
          <>
            <dt className="sr-only">Haste</dt>
            <dd className="flex items-center">
              <GiWingfoot aria-hidden="true" />
            </dd>
          </>
        )}

        {isStunned && (
          <>
            <dt className="sr-only">Stunned</dt>
            <dd className="flex items-center">
              <GiStarSwirl /> {turnsStunned}
            </dd>
          </>
        )}
      </dl>
    </article>
  )

  if (!isCompact) return cardElement

  return (
    <div className={`board-card group relative shrink-0 ${className}`}>
      {cardElement}

      <div
        aria-hidden="true"
        className="board-card__preview pointer-events-none absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <Card card={card} />
      </div>
    </div>
  )
}
