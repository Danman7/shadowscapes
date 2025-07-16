import { BoardCard } from 'src/modules/duel/components/BoardCard'
import {
  bottomPlayerHandCardId,
  topPlayerHandCardId,
} from 'src/modules/duel/components/constants'
import {
  Hand,
  HandCardContainer,
} from 'src/modules/duel/components/PlayerField/styles'
import { getTestId } from 'src/modules/duel/components/PlayerField/utils'

export const HandSection: React.FC<{
  hand: string[]
  isOnTop: boolean
  isUser: boolean
}> = ({ hand, isOnTop, isUser }) => (
  <Hand>
    {hand.map((cardId, index) => (
      <HandCardContainer
        key={cardId}
        $index={index}
        $total={hand.length}
        $isOnTop={isOnTop}
        $isUser={isUser}
        data-testid={getTestId(
          isOnTop,
          topPlayerHandCardId,
          bottomPlayerHandCardId,
        )}
      >
        <BoardCard cardId={cardId} animationDelay={index * 0.1} />
      </HandCardContainer>
    ))}
  </Hand>
)
