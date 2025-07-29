import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { GiCrossMark, GiScrollUnfurled } from 'react-icons/gi'

import { Button } from 'src/components/Button'
import { messages } from 'src/i18n'
import {
  ActionButtonWrapper,
  DuelBoard,
  LogEntry,
  LogsButtonWrapper,
  LogsCloseIcon,
  LogsContainer,
} from 'src/modules/duel/components/Board/styles'
import { PhaseModal } from 'src/modules/duel/components/PhaseModal'
import { PlayerField } from 'src/modules/duel/components/PlayerField/PlayerField'
import { useDuel } from 'src/modules/duel/hooks'
import { useActionButtonContentAndVisibility } from 'src/modules/duel/hooks/useActionButtonContentAndVisibility'
import { usePhaseModalContent } from 'src/modules/duel/hooks/usePhaseModalContent'
import { useThemeTransitionTimeInSeconds } from 'src/modules/duel/hooks/useThemeTransitionTimeInSeconds'
import { sortUserIdsForDuel } from 'src/modules/duel/utils'
import { useUser } from 'src/modules/user/hooks'

export const MainDuelView: React.FC = () => {
  const {
    state: {
      user: { id },
    },
  } = useUser()

  const {
    state: { activePlayerId, inactivePlayerId, logs },
  } = useDuel()

  const [areLogsVisible, setAreLogsVisible] = useState(false)

  const sortedPlayerIds = sortUserIdsForDuel(
    [activePlayerId, inactivePlayerId],
    id,
  )

  const delayInSeconds = useThemeTransitionTimeInSeconds()
  const phaseModalContent = usePhaseModalContent()
  const { isActionButtonVisible, actionButtonContent, actionButtonOnClick } =
    useActionButtonContentAndVisibility()

  return (
    <DuelBoard
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: delayInSeconds * 4 }}
    >
      <AnimatePresence mode="wait">
        {isActionButtonVisible && (
          <ActionButtonWrapper
            key="action-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
          >
            <Button onClick={actionButtonOnClick}>{actionButtonContent}</Button>
          </ActionButtonWrapper>
        )}

        {logs.length > 0 && (
          <LogsButtonWrapper
            key="logs-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
          >
            <Button onClick={() => setAreLogsVisible(true)} variant="outline">
              <GiScrollUnfurled />
            </Button>
          </LogsButtonWrapper>
        )}

        {areLogsVisible && (
          <LogsContainer
            key="logs-container"
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -200 }}
          >
            <LogsCloseIcon>
              <Button
                onClick={() => setAreLogsVisible(false)}
                variant="outline"
              >
                <GiCrossMark />
              </Button>
            </LogsCloseIcon>
            <h2>{messages.duel.logs.logsTitle}</h2>
            {logs.map((log, index) => (
              <LogEntry key={index}>{log}</LogEntry>
            ))}
          </LogsContainer>
        )}
      </AnimatePresence>

      <PhaseModal>{phaseModalContent}</PhaseModal>

      {sortedPlayerIds.map((playerId, index) => (
        <PlayerField
          key={`${playerId}-field`}
          playerId={playerId}
          isOnTop={!index}
        />
      ))}
    </DuelBoard>
  )
}
