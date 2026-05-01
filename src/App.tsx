import { useEffect } from 'react'

import { DuelView } from 'src/components'
import { GameProvider, useGameDispatch } from 'src/contexts'
import { MOCK_DUEL_SETUP, startDuel } from 'src/game-engine'

const AppContent: React.FC = () => {
  const dispatch = useGameDispatch()

  useEffect(() => {
    dispatch(startDuel({ players: MOCK_DUEL_SETUP }))
  }, [dispatch])

  return <DuelView />
}

export const App: React.FC = () => (
  <GameProvider>
    <AppContent />
  </GameProvider>
)

export default App
