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

export interface CardProps {
  card: CardBase<CardBaseId>
  onClick?: () => void
}

export const Card = ({ card, onClick }: CardProps) => {
  const { categories, faction, baseId, cost } = card

  const cardText = cardsText.cards[baseId]
  const isCardCharacter = isCharacter(card)
  const borderColor = factionBorderColorClassNames[faction]

  return (
    <article
      aria-label={`${cardText.name} card`}
      className={`card flex flex-col gap-2 overflow-hidden border-2 bg-surface p-2 ${borderColor} ${onClick ? 'card-glow card-glow--primary cursor-pointer' : ''}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) return

        event.preventDefault()
        onClick()
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header */}
      <div className="flex shrink-0 justify-between gap-2">
        <div>
          <div className="capitalize text-sm">{joinWithSpace(categories)}</div>

          <h2 className={`font-bold ${factionTextColorClassNames[faction]}`}>
            {cardText.name}
          </h2>
        </div>

        {isCardCharacter && (
          <dl>
            <dt className="sr-only">Life</dt>
            <dd className="text-xl font-bold">{card.life}</dd>
          </dl>
        )}
      </div>

      <hr className={`${borderColor}`} />

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto leading-snug">
        <p>{cardText.description}</p>

        <p className="text-sm italic text-foreground/80">{cardText.flavor}</p>
      </div>

      <hr className={`${borderColor}`} />

      {/* Footer */}
      <dl className="flex shrink-0 gap-2 items-center">
        <dt className="sr-only">Cost</dt>
        <dd className="coin">{cost}</dd>

        {isCardCharacter && card.charges && (
          <>
            <dt className="sr-only">Charges</dt>
            <dd className="flex items-center">
              <BsFillLightningChargeFill /> {card.charges}
            </dd>
          </>
        )}
      </dl>
    </article>
  )
}
