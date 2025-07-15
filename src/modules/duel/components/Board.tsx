import { AnimatePresence } from 'motion/react'
import React from 'react'
import { useTheme } from 'styled-components'

import { FullScreenLoader } from 'src/components/FullScreenLoader'
import { messages } from 'src/i18n/indext'
import { DuelIntroScreen } from 'src/modules/duel/components/DuelIntroScreen'
import { PlayerField } from 'src/modules/duel/components/PlayerField'
import { DuelBoard } from 'src/modules/duel/components/styles'
import { useDuel } from 'src/modules/duel/hooks'
import { useIntroScreenTimer } from 'src/modules/duel/hooks/useIntroScreenTimer'
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
    state: { players, phase, activePlayerId, inactivePlayerId },
  } = useDuel()

  const sortedPlayerIds = sortUserIdsForDuel(
    [activePlayerId, inactivePlayerId],
    id,
  )

  const { transitionTime } = useTheme()

  const delayInSeconds = transitionTime / 1000

  useIntroScreenTimer()

  return (
    <AnimatePresence>
      {isUserLoaded ? (
        <>
          {phase === 'Intro Screen' ? (
            <DuelIntroScreen
              userId={id}
              activePlayerId={activePlayerId}
              players={players}
            />
          ) : (
            <DuelBoard
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: delayInSeconds * 4 }}
            >
              {sortedPlayerIds.map((playerId, index) => (
                <PlayerField
                  key={`${playerId}-field`}
                  playerId={playerId}
                  isOnTop={!index}
                />
              ))}
            </DuelBoard>
          )}
        </>
      ) : (
        <FullScreenLoader message={messages.user.loadingUser} />
      )}
    </AnimatePresence>
  )
}
