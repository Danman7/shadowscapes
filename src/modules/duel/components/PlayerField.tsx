import { GiCardBurn, GiCardDraw } from 'react-icons/gi'
import { useTheme } from 'styled-components'

import { messages } from 'src/i18n'
import { BoardCard } from 'src/modules/duel/components/BoardCard'
import {
  bottomPlayerBoardCardId,
  bottomPlayerDeckCardId,
  bottomPlayerDiscardCardId,
  bottomPlayerHandCardId,
  topPlayerBoardCardId,
  topPlayerDeckCardId,
  topPlayerDiscardCardId,
  topPlayerHandCardId,
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
  StackLabelAndCount,
} from 'src/modules/duel/components/styles'
import { useDuel } from 'src/modules/duel/hooks'
import { useThemeTransitionTimeInSeconds } from 'src/modules/duel/hooks/useThemeTransitionTimeInSeconds'
import { useUser } from 'src/modules/user/hooks'

export const PlayerField: React.FC<{
  playerId: string
  isOnTop?: boolean
}> = ({ playerId, isOnTop }) => {
  const { spacing, card } = useTheme()
  const transitionInSeconds = useThemeTransitionTimeInSeconds()

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
        initial={{ right: -spacing * 40 }}
        animate={{ right: 0 }}
        transition={{
          delay: transitionInSeconds * (isActive ? 3 : 4),
        }}
        $isOnTop={isOnTop}
      >
        <PlayerInfo player={player} isActive={isActive} />
      </PlayerInfoFieldContainer>

      <Deck>
        {deck.length ? (
          <StackLabelAndCount $isOnTop={isOnTop}>
            <GiCardDraw /> {messages.duel.deckLabel}: {deck.length}
          </StackLabelAndCount>
        ) : null}

        {deck.map((cardId, index) => (
          <StackedCard
            initial={isOnTop ? { bottom: card.height } : { top: card.height }}
            animate={
              isOnTop
                ? { bottom: index * (spacing / 2) }
                : { top: index * (spacing / 2) }
            }
            transition={{ delay: (transitionInSeconds / 2) * index }}
            key={cardId}
            data-testid={isOnTop ? topPlayerDeckCardId : bottomPlayerDeckCardId}
          >
            <SmallCard $origin={isOnTop ? 'bottom left' : 'top left'}>
              <BoardCard cardId={cardId} />
            </SmallCard>
          </StackedCard>
        ))}
      </Deck>

      <Discard>
        {discard.length ? (
          <StackLabelAndCount $isOnTop={isOnTop}>
            <GiCardBurn /> {messages.duel.discardLabel}: {discard.length}
          </StackLabelAndCount>
        ) : null}

        {discard.map((cardId, index) => (
          <StackedCard
            $offset={index * (spacing / 2)}
            $isOnTop={isOnTop}
            key={cardId}
            data-testid={
              isOnTop ? topPlayerDiscardCardId : bottomPlayerDiscardCardId
            }
          >
            <SmallCard $origin={isOnTop ? 'bottom left' : 'top left'}>
              <BoardCard cardId={cardId} />
            </SmallCard>
          </StackedCard>
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
            data-testid={isOnTop ? topPlayerHandCardId : bottomPlayerHandCardId}
          >
            <BoardCard cardId={cardId} animationDelay={index * 0.1} />
          </HandCardContainer>
        ))}
      </Hand>
    </StyledPlayerField>
  )
}
