import type { CardBase } from '../../types'

export interface CardProps {
  card: CardBase
}

export const Card = ({ card }: CardProps) => {
  return (
    <article
      aria-label={`${card.name} card`}
      className="flex aspect-5/7 w-44 flex-col justify-between rounded border border-primary/30 bg-surface p-3 text-foreground shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-bold leading-tight">{card.name}</h2>
      </div>

      <dl className="flex items-center justify-between border-t border-primary/20 pt-2 text-sm">
        <dt className="font-semibold text-foreground/75">Cost</dt>
        <dd className="font-bold">{card.cost}</dd>
      </dl>
    </article>
  )
}
