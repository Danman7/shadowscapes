import { Card, getCardBase } from '../../../cards'
import type { CardInstance, CardInstanceId, DuelState } from '../../types'

interface RenderFaceUpCardsOptions {
  cardIds: CardInstanceId[]
  cards: DuelState['cards']
  getOnClick?: (card: CardInstance) => (() => void) | undefined
}

export const renderFaceUpCards = ({
  cardIds,
  cards,
  getOnClick,
}: RenderFaceUpCardsOptions) =>
  cardIds.map((cardId) => {
    const card = cards[cardId]

    return (
      <Card
        key={card.id}
        card={getCardBase(card.baseId)}
        onClick={getOnClick?.(card)}
      />
    )
  })
