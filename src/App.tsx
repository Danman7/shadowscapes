import { useEffect } from 'react'

import { DuelView } from 'src/components/DuelView'
import { GameProvider, useGameDispatch } from 'src/contexts/GameContext'
import { DEFAULT_DUEL_SETUP } from 'src/test/mocks/duelSetup'

const AppContent: React.FC = () => {
  const dispatch = useGameDispatch()

  useEffect(() => {
    dispatch({
      type: 'START_DUEL',
      payload: DEFAULT_DUEL_SETUP,
    })
  }, [dispatch])

  return <DuelView />
}

export const App: React.FC = () => (
  <GameProvider>
    <AppContent />
  </GameProvider>
)

export default App
