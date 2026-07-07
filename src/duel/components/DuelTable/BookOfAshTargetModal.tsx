import { Card } from '../../../cards'
import { cardsText } from '../../../l10n'
import { Modal } from '../../../shared/components'
import { selectCardEffectTarget } from '../../cardEffects'
import { useDuelDispatch, useDuelState } from '../../hooks'
import { isCharacterInstance } from '../../utils'
import { getDisplayCardFromInstance } from './getDisplayCardFromInstance'

export const BookOfAshTargetModal = () => {
  const dispatch = useDuelDispatch()
  const { cards, pendingPlayedCardId, players } = useDuelState()
  const pendingCard = pendingPlayedCardId
    ? cards[pendingPlayedCardId]
    : undefined
  const player = pendingCard ? players[pendingCard.ownerId] : undefined

  if (
    pendingCard?.baseId !== 'bookOfAsh' ||
    pendingCard.stack !== 'board' ||
    !player
  ) {
    return null
  }

  const discardedCharacterIds = player.discard.filter((cardId) =>
    isCharacterInstance(cards[cardId]),
  )

  if (discardedCharacterIds.length === 0) return null

  return (
    <Modal title={cardsText.cards.bookOfAsh.name}>
      <div className="flex max-w-full gap-3 overflow-x-auto p-1">
        {discardedCharacterIds.map((cardId) => (
          <Card
            card={getDisplayCardFromInstance(cards[cardId])}
            key={cardId}
            onClick={() =>
              dispatch(selectCardEffectTarget({ targetCardInstanceId: cardId }))
            }
          />
        ))}
      </div>
    </Modal>
  )
}
