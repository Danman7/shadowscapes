import { useEffect } from 'react'

import { DuelView } from '@/components/DuelView'
import { GameProvider, useGameDispatch } from '@/contexts/GameContext'
import { DEFAULT_DUEL_SETUP } from '@/test/mocks/duelSetup'

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
