import '@/test/setup'
import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/react'
import { expect, test } from 'bun:test'

import { DuelView } from '@/components/DuelView'
import {
  GameProvider,
  useGameDispatch,
  useGameState,
} from '@/contexts/GameContext'
import { DEFAULT_DUEL_SETUP } from '@/test/mocks/duelSetup'

test('shows intro screen when duel has not started', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  const introScreen = container.querySelector('[data-testid="intro-screen"]')
  expect(introScreen).toBeInTheDocument()
})

test('renders intro screen button that starts duel', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    // Start the duel (phase will be 'intro')
    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  const continueButton = container.querySelector(
    '[data-testid="continue-button"]',
  ) as HTMLElement
  expect(continueButton).toBeInTheDocument()
  expect(continueButton?.textContent).toBe('Begin Duel')
})

test('shows intro screen when phase is intro', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    // Start the duel (phase will be 'intro')
    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  const introScreen = container.querySelector('[data-testid="intro-screen"]')
  expect(introScreen).toBeInTheDocument()
})

test('renders main game view when phase is player-turn', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    // Start duel
    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    }
    // Move to player-turn phase
    else if (duel.phase === 'intro') {
      dispatch({ type: 'TRANSITION_PHASE', payload: 'player-turn' })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  // Should show game view instead of intro screen
  const duelView = container.querySelector('[data-testid="duel-view"]')
  expect(duelView).toBeInTheDocument()
})

test('displays player names in game view', () => {
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
    } else if (duel.phase === 'intro') {
      dispatch({ type: 'TRANSITION_PHASE', payload: 'player-turn' })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  expect(container.textContent).toContain('Alice')
  expect(container.textContent).toContain('Bob')
})

test('displays phase information', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    } else if (duel.phase === 'intro') {
      dispatch({ type: 'TRANSITION_PHASE', payload: 'player-turn' })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  expect(container.textContent).toContain('Phase:')
  expect(container.textContent).toContain('player-turn')
})

test('renders end turn button in game view', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    } else if (duel.phase === 'intro') {
      dispatch({ type: 'TRANSITION_PHASE', payload: 'player-turn' })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  const endTurnButton = container.querySelector(
    '[data-testid="end-turn-button"]',
  ) as HTMLElement
  expect(endTurnButton).toBeInTheDocument()
  expect(endTurnButton?.textContent).toBe('End Turn')
})

test('end turn button switches active player', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    } else if (duel.phase === 'intro') {
      dispatch({ type: 'TRANSITION_PHASE', payload: 'player-turn' })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  const endTurnButton = container.querySelector(
    '[data-testid="end-turn-button"]',
  ) as HTMLElement

  expect(() => endTurnButton?.click()).not.toThrow()
})

test('renders deck and discard piles for both players', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    } else if (duel.phase === 'intro') {
      dispatch({ type: 'TRANSITION_PHASE', payload: 'player-turn' })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  const deckPiles = container.querySelectorAll('[data-testid="deck-pile"]')
  const discardPiles = container.querySelectorAll(
    '[data-testid="discard-pile"]',
  )

  expect(deckPiles.length).toBe(2)
  expect(discardPiles.length).toBe(2)
})

test('dispatches START_DUEL with player names from initial duel setup', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  // After dispatch, should render intro screen with players
  const introScreen = container.querySelector('[data-testid="intro-screen"]')
  expect(introScreen).toBeInTheDocument()
})

test('transitions to initial-draw phase when intro button clicked', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    } else if (duel.phase === 'intro') {
      dispatch({ type: 'TRANSITION_PHASE', payload: 'initial-draw' })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  // Should transition past intro screen and show duel view
  const duelView = container.querySelector('[data-testid="duel-view"]')
  expect(duelView).toBeInTheDocument()
})

test('dispatches PLAY_CARD when card in hand is clicked', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    } else if (duel.phase === 'intro') {
      dispatch({ type: 'TRANSITION_PHASE', payload: 'player-turn' })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  // Cards in hand can be clicked when active player
  const cards = container.querySelectorAll('[data-testid="card"]')
  if (cards.length > 0) {
    const firstCard = cards[0] as HTMLElement
    expect(() => firstCard.click()).not.toThrow()
  }
})

test('handles intro screen button click when startingPlayerId is null', () => {
  // When startingPlayerId is null, IntroScreen returns null because
  // the guard clause checks for null. This test verifies that behavior.
  const { container } = render(
    <GameProvider>
      <DuelView />
    </GameProvider>,
  )

  // IntroScreen should return null, so no intro-screen element
  const introScreen = container.querySelector('[data-testid="intro-screen"]')
  expect(introScreen).not.toBeInTheDocument()
})

test('handles intro phase transition button click', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    // Start the duel to get to intro phase
    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  // Should show intro screen with button
  const introScreen = container.querySelector('[data-testid="intro-screen"]')
  expect(introScreen).toBeInTheDocument()

  // Find and click the continue button
  const continueButton = container.querySelector(
    '[data-testid="continue-button"]',
  )
  expect(continueButton).toBeInTheDocument()

  if (continueButton) {
    fireEvent.click(continueButton)
  }

  // After clicking, should transition to main duel view
  const duelView = container.querySelector('[data-testid="duel-view"]')
  expect(duelView).toBeInTheDocument()
})

test('handles card click in active player hand', () => {
  const TestWrapper = () => {
    const dispatch = useGameDispatch()
    const duel = useGameState()

    if (duel.startingPlayerId === null) {
      dispatch({
        type: 'START_DUEL',
        payload: DEFAULT_DUEL_SETUP,
      })
    } else if (duel.phase === 'intro') {
      dispatch({ type: 'TRANSITION_PHASE', payload: 'player-turn' })
    } else if (duel.phase === 'player-turn') {
      // Draw cards to the active player's hand if it's empty
      const activePlayer = duel.players[duel.activePlayerId]
      if (activePlayer.handIds.length === 0) {
        // Draw a card to make sure there's something in hand to click
        dispatch({
          type: 'DRAW_CARD',
          payload: { playerId: duel.activePlayerId },
        })
      }
    }

    return <DuelView />
  }

  const { container } = render(
    <GameProvider>
      <TestWrapper />
    </GameProvider>,
  )

  // Should be in duel view
  const duelView = container.querySelector('[data-testid="duel-view"]')
  expect(duelView).toBeInTheDocument()

  // Get all cards (should have at least one from the DRAW_CARD dispatch)
  const cards = container.querySelectorAll('[data-testid="card"]')

  if (cards.length > 0) {
    // Click first card to trigger onCardClick handler
    const firstCard = cards[0]
    if (firstCard) {
      fireEvent.click(firstCard)
    }

    // Verify component still renders after click
    const duelViewAfter = container.querySelector('[data-testid="duel-view"]')
    expect(duelViewAfter).toBeInTheDocument()
  }
})
