import { DuelProvider } from 'src/modules/duel/components/DuelProvider'
import { useDuel } from 'src/modules/duel/hooks'
import { mockInitializeDuelMockState } from 'src/modules/duel/mocks'
import { DuelState } from 'src/modules/duel/types'
import { render } from 'src/test-utils'

const duelNotLoadedMessage = 'Duel not loaded'

const TestComponent: React.FC = () => {
  const {
    state: { activePlayerId, inactivePlayerId, phase },
  } = useDuel()

  return activePlayerId ? (
    <div>
      <p>{activePlayerId}</p>
      <p>{inactivePlayerId}</p>
      <p>{phase}</p>
    </div>
  ) : (
    <div>{duelNotLoadedMessage}</div>
  )
}

it('should provide initial state', () => {
  const { getByText } = render(
    <DuelProvider>
      <TestComponent />
    </DuelProvider>,
  )

  expect(getByText(duelNotLoadedMessage)).toBeInTheDocument()
})

it('should initialize with preloaded state if provided', () => {
  const preloadedState: DuelState = mockInitializeDuelMockState

  const { getByText } = render(
    <DuelProvider preloadedState={preloadedState}>
      <TestComponent />
    </DuelProvider>,
  )

  const { phase, activePlayerId, inactivePlayerId } = preloadedState

  expect(getByText(activePlayerId)).toBeInTheDocument()
  expect(getByText(inactivePlayerId)).toBeInTheDocument()
  expect(getByText(phase)).toBeInTheDocument()
})
