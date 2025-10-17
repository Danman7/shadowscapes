import { render } from '@testing-library/react'

import { DuelProvider } from '@/components/Duel/DuelProvider'
import { useDuel } from '@/components/Duel/hooks/useDuel'
import { mockInitialDuelStateWithPlayers } from '@/mocks'
import { DuelState } from '@/types'

const TestComponent: React.FC = () => {
  const {
    state: { activePlayerId, phase },
  } = useDuel()

  return (
    <div>
      <p>{activePlayerId}</p>
      <p>{phase}</p>
    </div>
  )
}

it('should initialize with preloaded state if provided', () => {
  const preloadedState: DuelState = mockInitialDuelStateWithPlayers

  const { getByText } = render(
    <DuelProvider preloadedState={preloadedState}>
      <TestComponent />
    </DuelProvider>,
  )

  const { phase, activePlayerId } = preloadedState

  expect(getByText(activePlayerId)).toBeInTheDocument()
  expect(getByText(phase)).toBeInTheDocument()
})
