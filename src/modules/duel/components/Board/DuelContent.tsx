import { DuelIntroScreen } from 'src/modules/duel/components/Board/DuelIntroScreen'
import { MainDuelView } from 'src/modules/duel/components/Board/MainDuelView'
import { useDuel } from 'src/modules/duel/hooks'
import { useUser } from 'src/modules/user/hooks'

export const DuelContent: React.FC = () => {
  const {
    state: {
      user: { id },
    },
  } = useUser()

  const {
    state: { players, phase, activePlayerId },
  } = useDuel()

  if (phase === 'Intro Screen') {
    return (
      <DuelIntroScreen
        userId={id}
        activePlayerId={activePlayerId}
        players={players}
      />
    )
  }

  return <MainDuelView />
}
