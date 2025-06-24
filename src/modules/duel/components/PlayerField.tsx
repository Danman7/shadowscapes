import { useTheme } from 'styled-components'

import { BoardCard } from 'src/modules/duel/components/BoardCard'
import {
  bottomPlayerBoardCardId,
  bottomPlayerDeckCardId,
  bottomPlayerDiscardCardId,
  topPlayerBoardCardId,
  topPlayerDeckCardId,
  topPlayerDiscardCardId,
} from 'src/modules/duel/components/constants'
import { PlayerInfo } from 'src/modules/duel/components/PlayerInfo'
import {
  FieldBoard,
  Deck,
  Discard,
  PlayerInfoFieldContainer,
  SmallCard,
  StackedCard,
  StyledPlayerField,
  BoardCardsCointainer,
  Hand,
  HandCardContainer,
} from 'src/modules/duel/components/styles'
import { useDuel } from 'src/modules/duel/hooks'
import { useUser } from 'src/modules/user/hooks'

export const PlayerField: React.FC<{
  playerId: string
  isOnTop?: boolean
}> = ({ playerId, isOnTop }) => {
  const theme = useTheme()

  const {
    state: {
      user: { id: userId },
    },
  } = useUser()

  const {
    state: { players, activePlayerId },
  } = useDuel()

  const isUser = userId === playerId

  const player = players[playerId]
  const isActive = playerId === activePlayerId
  const { deck, discard, board, hand } = player

  return (
    <StyledPlayerField $isOnTop={isOnTop}>
      <PlayerInfoFieldContainer
        initial={{ right: -theme.spacing * 40 }}
        animate={{ right: 0 }}
        transition={{ delay: (theme.transitionTime / 1000) * 2 }}
        $isOnTop={isOnTop}
      >
        <PlayerInfo player={player} isActive={isActive} />
      </PlayerInfoFieldContainer>

      <Deck>
        {deck.map((cardId) => (
          <SmallCard
            key={cardId}
            data-testid={isOnTop ? topPlayerDeckCardId : bottomPlayerDeckCardId}
          >
            <StackedCard $top={isOnTop ? -226 : 0}>
              <BoardCard cardId={cardId} />
            </StackedCard>
          </SmallCard>
        ))}
      </Deck>

      <Discard>
        {discard.map((cardId) => (
          <SmallCard
            key={cardId}
            data-testid={
              isOnTop ? topPlayerDiscardCardId : bottomPlayerDiscardCardId
            }
          >
            <StackedCard $top={isOnTop ? -226 : 0}>
              <BoardCard cardId={cardId} />
            </StackedCard>
          </SmallCard>
        ))}
      </Discard>

      <FieldBoard $isOnTop={isOnTop}>
        <BoardCardsCointainer>
          {board.map((cardId) => (
            <SmallCard
              key={cardId}
              data-testid={
                isOnTop ? topPlayerBoardCardId : bottomPlayerBoardCardId
              }
              $origin="top center"
            >
              <BoardCard cardId={cardId} />
            </SmallCard>
          ))}
        </BoardCardsCointainer>
      </FieldBoard>

      <Hand>
        {hand.map((cardId, index) => (
          <HandCardContainer
            key={cardId}
            $index={index}
            $total={hand.length}
            $isOnTop={isOnTop}
            $isUser={isUser}
          >
            <BoardCard cardId={cardId} />
          </HandCardContainer>
        ))}
      </Hand>
    </StyledPlayerField>
  )
}
