import { PlayerField } from 'src/modules/duel/components/PlayerField/PlayerField'
import { DuelBoard } from 'src/modules/duel/components/styles'
import { useDuel } from 'src/modules/duel/hooks'
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

  return (
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
  )
}
