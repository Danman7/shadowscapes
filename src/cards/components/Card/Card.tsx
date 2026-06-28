import { joinWithSpace } from '../../../shared/utils'
import {
  factionBorderColorClassNames,
  factionTextColorClassNames,
} from '../../constants'
import type { CardBase } from '../../types'
import { isCharacter } from '../../utils'

export interface CardProps {
  card: CardBase
}

export const Card = ({ card }: CardProps) => {
  const isCardCharacter = isCharacter(card)

  return (
    <article
      aria-label={`${card.name} card`}
      className={`card flex flex-col justify-between border-2 bg-surface p-2 ${factionBorderColorClassNames[card.faction]}`}
    >
      <div className="flex justify-between">
        <div>
          <div className="capitalize text-sm">
            {joinWithSpace(card.categories)}
          </div>

          <h2
            className={`font-bold ${factionTextColorClassNames[card.faction]}`}
          >
            {card.name}
          </h2>
        </div>

        {isCardCharacter && (
          <dl>
            <dt className="sr-only">Life</dt>
            <dd className="text-xl font-bold">{card.life}</dd>
          </dl>
        )}
      </div>

      <dl
        className={`flex gap-2 items-center justify-between border-t-2 pt-2 text-sm ${factionBorderColorClassNames[card.faction]}`}
      >
        <dt className="sr-only">Cost</dt>
        <dd className="coin">{card.cost}</dd>
      </dl>
    </article>
  )
}
