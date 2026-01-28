import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect, test } from 'vitest'

import { IntroScreen } from '@/components/IntroScreen'
import {
  GameProvider,
  useGameDispatch,
  useGameState,
} from '@/contexts/GameContext'
import { DEFAULT_DUEL_SETUP } from '@/test/mocks/duelSetup'

test('returns null when duel has not started (startingPlayerId is null)', () => {
  const { queryByTestId } = render(
    <GameProvider>
      <IntroScreen />
    </GameProvider>,
  )

  const introScreen = queryByTestId('intro-screen')
  expect(introScreen).not.toBeInTheDocument()
})

test('renders intro screen when duel has started', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: {
          ...DEFAULT_DUEL_SETUP,
          player1Name: 'Alice',
          player2Name: 'Bob',
        },
      })
    }

    return <IntroScreen />
  }

  const { getByText } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  expect(getByText('Alice')).toBeInTheDocument()
  expect(getByText('Bob')).toBeInTheDocument()
  expect(getByText('VS')).toBeInTheDocument()
})
