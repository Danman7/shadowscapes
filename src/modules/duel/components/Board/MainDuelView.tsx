import { AnimatePresence } from 'motion/react'

import { Button } from 'src/components/Button'
import {
  ActionButtonWrapper,
  DuelBoard,
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
    state: { activePlayerId, inactivePlayerId },
  } = useDuel()

  const sortedPlayerIds = sortUserIdsForDuel(
    [activePlayerId, inactivePlayerId],
    id,
  )

  const delayInSeconds = useThemeTransitionTimeInSeconds()
  const phaseModalContent = usePhaseModalContent()
  const { isButtonVisible, buttonContent, buttonOnClick } =
    useActionButtonContentAndVisibility()

  return (
    <DuelBoard
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: delayInSeconds * 4 }}
    >
      <AnimatePresence>
        {isButtonVisible && (
          <ActionButtonWrapper
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{
              duration: delayInSeconds * 2,
              type: 'spring',
            }}
          >
            <Button onClick={buttonOnClick}>{buttonContent}</Button>
          </ActionButtonWrapper>
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
