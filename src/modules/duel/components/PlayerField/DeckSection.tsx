import { GiCardDraw } from 'react-icons/gi'

import { messages } from 'src/i18n'
import { BoardCard } from 'src/modules/duel/components/BoardCard'
import {
  bottomPlayerDeckCardId,
  topPlayerDeckCardId,
} from 'src/modules/duel/components/constants'
import {
  Deck,
  SmallCard,
  StackedCard,
  StackLabelAndCount,
} from 'src/modules/duel/components/PlayerField/styles'
import {
  getCardOrigin,
  getTestId,
} from 'src/modules/duel/components/PlayerField/utils'

export const DeckSection: React.FC<{
  deck: string[]
  isOnTop: boolean
  spacing: number
  cardHeight: number
  transitionInSeconds: number
}> = ({ deck, isOnTop, spacing, cardHeight, transitionInSeconds }) => {
  if (!deck.length) return null

  return (
    <Deck>
      <StackLabelAndCount $isOnTop={isOnTop}>
        <GiCardDraw /> {messages.duel.deckLabel}: {deck.length}
      </StackLabelAndCount>

      {deck.map((cardId, index) => (
        <StackedCard
          initial={isOnTop ? { bottom: cardHeight } : { top: cardHeight }}
          animate={
            isOnTop
              ? { bottom: index * (spacing / 2) }
              : { top: index * (spacing / 2) }
          }
          transition={{ delay: (transitionInSeconds / 2) * index }}
          key={cardId}
          data-testid={getTestId(
            isOnTop,
            topPlayerDeckCardId,
            bottomPlayerDeckCardId,
          )}
        >
          <SmallCard $origin={getCardOrigin(isOnTop)}>
            <BoardCard cardId={cardId} />
          </SmallCard>
        </StackedCard>
      ))}
    </Deck>
  )
}
