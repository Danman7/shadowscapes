import { AnimatePresence } from 'motion/react'
import React from 'react'

import { MoonLoading } from 'src/components/MoonLoading'
import { FullScreenCenteredContainer } from 'src/components/styles'
import { messages } from 'src/i18n/indext'
import { PlayerField } from 'src/modules/duel/components/PlayerField'
import { DuelBoard } from 'src/modules/duel/components/styles'
import { useDuel } from 'src/modules/duel/hooks'
import { sortUserIdsForDuel } from 'src/modules/duel/utils'
import { useUser } from 'src/modules/user/hooks'

export const Board: React.FC = () => {
  const {
    state: {
      isUserLoaded,
      user: { id },
    },
  } = useUser()

  const {
    state: { activePlayerId, inactivePlayerId },
  } = useDuel()

  const sortedPlayerIds = sortUserIdsForDuel(
    [activePlayerId, inactivePlayerId],
    id,
  )

  return (
    <AnimatePresence>
      {isUserLoaded ? (
        <DuelBoard
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {sortedPlayerIds.map((playerId, index) => (
            <PlayerField
              key={`${playerId}-field`}
              playerId={playerId}
              isOnTop={!index}
            />
          ))}
        </DuelBoard>
      ) : (
        <FullScreenCenteredContainer
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <h1>
            <MoonLoading /> {messages.user.loadingUser}
          </h1>
        </FullScreenCenteredContainer>
      )}
    </AnimatePresence>
  )
}
