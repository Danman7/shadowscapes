import { render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, expect, test } from 'vitest'

import { IntroScreen } from '@/components/IntroScreen'
import { GameProvider } from '@/contexts/GameContext'
import { useGameDispatch } from '@/contexts/GameContext'
import { DEFAULT_DUEL_SETUP } from '@/test/mocks/duelSetup'

function IntroScreenWithDuel({ onContinue }: { onContinue?: () => void }) {
  const dispatch = useGameDispatch()

  useEffect(() => {
    dispatch({
      type: 'START_DUEL',
      payload: DEFAULT_DUEL_SETUP,
    })
  }, [dispatch])

  return <IntroScreen onContinue={onContinue} />
}

describe('IntroScreen', () => {
  test('renders intro screen with player names', () => {
    const { container } = render(
      <GameProvider>
        <IntroScreenWithDuel />
      </GameProvider>,
    )

    expect(screen.getByText('Shadowscapes')).toBeTruthy()
    expect(screen.getByText(DEFAULT_DUEL_SETUP.player1Name)).toBeTruthy()
    expect(screen.getByText('VS')).toBeTruthy()
    expect(screen.getByText(DEFAULT_DUEL_SETUP.player2Name)).toBeTruthy()
    expect(container.firstChild).toBeTruthy()
  })

  test('displays starting player', () => {
    render(
      <GameProvider>
        <IntroScreenWithDuel />
      </GameProvider>,
    )

    const startingText = screen.getByText(/starts first/)
    expect(startingText).toBeTruthy()
    expect(
      startingText.textContent ===
        `${DEFAULT_DUEL_SETUP.player1Name} starts first` ||
        startingText.textContent ===
          `${DEFAULT_DUEL_SETUP.player2Name} starts first`,
    ).toBe(true)
  })

  test('renders continue button when onContinue provided', () => {
    render(
      <GameProvider>
        <IntroScreenWithDuel onContinue={() => {}} />
      </GameProvider>,
    )

    expect(screen.getByTestId('continue-button')).toBeTruthy()
  })

  test('does not render continue button when onContinue not provided', () => {
    render(
      <GameProvider>
        <IntroScreenWithDuel />
      </GameProvider>,
    )

    expect(screen.queryByTestId('continue-button')).toBeNull()
  })

  test('returns null when no duel state', () => {
    const { container } = render(
      <GameProvider>
        <IntroScreen />
      </GameProvider>,
    )

    expect(container.firstChild).toBeNull()
  })
})
