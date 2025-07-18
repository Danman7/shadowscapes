import { useTheme } from 'styled-components'

import { BoardSection } from 'src/modules/duel/components/PlayerField/BoardSection'
import { DeckSection } from 'src/modules/duel/components/PlayerField/DeckSection'
import { DiscardSection } from 'src/modules/duel/components/PlayerField/DiscardSection'
import { HandSection } from 'src/modules/duel/components/PlayerField/HandSection'
import { PlayerInfo } from 'src/modules/duel/components/PlayerField/PlayerInfo'
import {
  PlayerInfoFieldContainer,
  StyledPlayerField,
} from 'src/modules/duel/components/PlayerField/styles'
import { useDuel } from 'src/modules/duel/hooks'
import { useThemeTransitionTimeInSeconds } from 'src/modules/duel/hooks/useThemeTransitionTimeInSeconds'
import { useUser } from 'src/modules/user/hooks'

export const PlayerField: React.FC<{
  playerId: string
  isOnTop: boolean
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

  const playerInfoAnimationDelay = transitionInSeconds * (isActive ? 3 : 4)

  return (
    <StyledPlayerField $isOnTop={isOnTop}>
      <PlayerInfoFieldContainer
        initial={{ right: -spacing * 40 }}
        animate={{ right: 0 }}
        transition={{ delay: playerInfoAnimationDelay }}
        $isOnTop={isOnTop}
      >
        <PlayerInfo player={player} isActive={isActive} />
      </PlayerInfoFieldContainer>

      <DeckSection
        deck={deck}
        isOnTop={isOnTop}
        spacing={spacing}
        cardHeight={card.height}
        transitionInSeconds={transitionInSeconds}
      />

      <DiscardSection discard={discard} isOnTop={isOnTop} spacing={spacing} />

      <BoardSection board={board} isOnTop={isOnTop} />

      <HandSection hand={hand} isOnTop={isOnTop} isUser={isUser} />
    </StyledPlayerField>
  )
}
