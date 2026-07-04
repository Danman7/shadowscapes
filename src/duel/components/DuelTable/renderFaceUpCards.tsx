import { Card, getCardBase } from '../../../cards'
import type { CardInstance, CardInstanceId, DuelState } from '../../types'

interface RenderFaceUpCardsOptions {
  cardIds: CardInstanceId[]
  cards: DuelState['cards']
  isCompact?: boolean
  getOnClick?: (card: CardInstance) => (() => void) | undefined
}

export const renderFaceUpCards = ({
  cardIds,
  cards,
  isCompact,
  getOnClick,
}: RenderFaceUpCardsOptions) =>
  cardIds.map((cardId) => {
    const card = cards[cardId]

    return (
      <Card
        key={card.id}
        card={getCardBase(card.baseId)}
        isCompact={isCompact}
        onClick={getOnClick?.(card)}
      />
    )
  })
