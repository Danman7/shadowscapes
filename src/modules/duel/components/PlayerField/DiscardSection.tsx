import { GiCardBurn } from 'react-icons/gi'

import { messages } from 'src/i18n'
import { BoardCard } from 'src/modules/duel/components/BoardCard'
import {
  bottomPlayerDiscardCardId,
  topPlayerDiscardCardId,
} from 'src/modules/duel/components/constants'
import {
  Discard,
  SmallCard,
  StackedCard,
  StackLabelAndCount,
} from 'src/modules/duel/components/PlayerField/styles'
import {
  getCardOrigin,
  getTestId,
} from 'src/modules/duel/components/PlayerField/utils'

export const DiscardSection: React.FC<{
  discard: string[]
  isOnTop: boolean
  spacing: number
}> = ({ discard, isOnTop, spacing }) => {
  if (!discard.length) return null

  return (
    <Discard>
      <StackLabelAndCount $isOnTop={isOnTop}>
        <GiCardBurn /> {messages.duel.discardLabel}: {discard.length}
      </StackLabelAndCount>

      {discard.map((cardId, index) => (
        <StackedCard
          $offset={index * (spacing / 2)}
          $isOnTop={isOnTop}
          key={cardId}
          data-testid={getTestId(
            isOnTop,
            topPlayerDiscardCardId,
            bottomPlayerDiscardCardId,
          )}
        >
          <SmallCard $origin={getCardOrigin(isOnTop)}>
            <BoardCard cardId={cardId} />
          </SmallCard>
        </StackedCard>
      ))}
    </Discard>
  )
}
