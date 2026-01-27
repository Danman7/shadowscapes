import '@/test/setup'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect, mock, test } from 'bun:test'

import { IntroScreen } from '@/components/IntroScreen'
import {
  GameProvider,
  useGameDispatch,
  useGameState,
} from '@/contexts/GameContext'
import { DEFAULT_DUEL_SETUP } from '@/test/mocks/duelSetup'

test('returns null when duel has not started (startingPlayerId is null)', () => {
  const { container } = render(
    <GameProvider>
      <IntroScreen />
    </GameProvider>,
  )

  const introScreen = container.querySelector('[data-testid="intro-screen"]')
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

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  const introScreen = container.querySelector('[data-testid="intro-screen"]')
  expect(introScreen).toBeInTheDocument()
})

test('displays player names correctly', () => {
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

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  expect(container.textContent).toContain('Alice')
  expect(container.textContent).toContain('Bob')
  expect(container.textContent).toContain('VS')
})

test('displays starting player information', () => {
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

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  expect(container.textContent).toContain('starts first')
})

test('displays title "Shadowscapes"', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: {
          ...DEFAULT_DUEL_SETUP,
          player1Name: 'Player 1',
          player2Name: 'Player 2',
        },
      })
    }

    return <IntroScreen />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  expect(container.textContent).toContain('Shadowscapes')
})

test('calls onContinue when button is clicked', () => {
  const handleContinue = mock(() => {})

  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: {
          ...DEFAULT_DUEL_SETUP,
          player1Name: 'Player 1',
          player2Name: 'Player 2',
        },
      })
    }

    return <IntroScreen onContinue={handleContinue} />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  const button = container.querySelector(
    '[data-testid="continue-button"]',
  ) as HTMLElement
  button?.click()

  expect(handleContinue).toHaveBeenCalledTimes(1)
})

test('does not render button when onContinue is not provided', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: {
          ...DEFAULT_DUEL_SETUP,
          player1Name: 'Player 1',
          player2Name: 'Player 2',
        },
      })
    }

    return <IntroScreen />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  const button = container.querySelector('[data-testid="continue-button"]')
  expect(button).not.toBeInTheDocument()
})

test('button has correct text', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: {
          ...DEFAULT_DUEL_SETUP,
          player1Name: 'Player 1',
          player2Name: 'Player 2',
        },
      })
    }

    return <IntroScreen onContinue={() => {}} />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  const button = container.querySelector('[data-testid="continue-button"]')
  expect(button?.textContent).toBe('Begin Duel')
})
