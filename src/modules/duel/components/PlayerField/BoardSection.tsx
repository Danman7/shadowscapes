import { BoardCard } from 'src/modules/duel/components/BoardCard'
import {
  bottomPlayerBoardCardId,
  topPlayerBoardCardId,
} from 'src/modules/duel/components/constants'
import {
  BoardCardsCointainer,
  FieldBoard,
  SmallCard,
} from 'src/modules/duel/components/PlayerField/styles'
import { getTestId } from 'src/modules/duel/components/PlayerField/utils'

export const BoardSection: React.FC<{
  board: string[]
  isOnTop: boolean
}> = ({ board, isOnTop }) => (
  <FieldBoard $isOnTop={isOnTop}>
    <BoardCardsCointainer>
      {board.map((cardId) => (
        <SmallCard
          key={cardId}
          data-testid={getTestId(
            isOnTop,
            topPlayerBoardCardId,
            bottomPlayerBoardCardId,
          )}
          $origin="top center"
        >
          <BoardCard cardId={cardId} />
        </SmallCard>
      ))}
    </BoardCardsCointainer>
  </FieldBoard>
)
