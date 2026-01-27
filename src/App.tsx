import { useEffect } from 'react'

import { DuelView } from '@/components/DuelView'
import { GameProvider, useGameDispatch } from '@/contexts/GameContext'
import { DEFAULT_DUEL_SETUP } from '@/test/mocks/duelSetup'

/**
 * AppContent - initializes the duel on mount
 */
function AppContent() {
  const dispatch = useGameDispatch()

  useEffect(() => {
    dispatch({
      type: 'START_DUEL',
      payload: DEFAULT_DUEL_SETUP,
    })
  }, [dispatch])

  return <DuelView />
}

/**
 * App - main application component
 */
export function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}

export default App
