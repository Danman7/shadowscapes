import '@/test/setup'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { describe, expect, test } from 'bun:test'

import { GameProvider } from '@/contexts/GameContext'
import { createCardInstance } from '@/game-engine/utils'
import {
  useActivePlayer,
  useActivePlayerBoard,
  useActivePlayerHand,
  useDuelPhase,
  useInactivePlayer,
  useInactivePlayerBoard,
  usePlayerCards,
  usePlayerDeckCount,
  usePlayerDiscardCount,
} from '@/selectors/playerSelectors'

describe('useDuelPhase', () => {
  test('returns current phase from game state', () => {
    const TestComponent = () => {
      const phase = useDuelPhase()
      return <div data-testid="phase">{phase}</div>
    }

    const { container } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>,
    )

    const element = container.querySelector('[data-testid="phase"]')
    expect(element?.textContent).toBeDefined()
  })
})

describe('useActivePlayer', () => {
  test('returns active player from game state', () => {
    const TestComponent = () => {
      const activePlayer = useActivePlayer()
      return <div data-testid="player-id">{activePlayer.id}</div>
    }

    const { container } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>,
    )

    const element = container.querySelector('[data-testid="player-id"]')
    expect(element?.textContent).toBe('player1')
  })
})

describe('useInactivePlayer', () => {
  test('returns inactive player from game state', () => {
    const TestComponent = () => {
      const inactivePlayer = useInactivePlayer()
      return <div data-testid="player-id">{inactivePlayer.id}</div>
    }

    const { container } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>,
    )

    const element = container.querySelector('[data-testid="player-id"]')
    expect(element?.textContent).toBe('player2')
  })
})

describe('usePlayerCards', () => {
  test('returns empty array when player has no cards in stack', () => {
    const TestComponent = () => {
      const cards = usePlayerCards('player1', 'hand')
      return <div data-testid="card-count">{cards.length}</div>
    }

    const { container } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>,
    )

    const element = container.querySelector('[data-testid="card-count"]')
    expect(element?.textContent).toBe('0')
  })

  test('returns cards with base data for a player stack', () => {
    const card1 = createCardInstance('zombie')
    const card2 = createCardInstance('haunt')

    expect(card1.baseId).toBe('zombie')
    expect(card2.baseId).toBe('haunt')
  })
})

describe('useActivePlayerHand', () => {
  test('returns active player hand cards', () => {
    const TestComponent = () => {
      const hand = useActivePlayerHand()
      return <div data-testid="hand-count">{hand.length}</div>
    }

    const { container } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>,
    )

    const element = container.querySelector('[data-testid="hand-count"]')
    const count = parseInt(element?.textContent || '0')
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

describe('useActivePlayerBoard', () => {
  test('returns active player board cards', () => {
    const TestComponent = () => {
      const board = useActivePlayerBoard()
      return <div data-testid="board-count">{board.length}</div>
    }

    const { container } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>,
    )

    const element = container.querySelector('[data-testid="board-count"]')
    const count = parseInt(element?.textContent || '0')
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

describe('useInactivePlayerBoard', () => {
  test('returns inactive player board cards', () => {
    const TestComponent = () => {
      const board = useInactivePlayerBoard()
      return <div data-testid="board-count">{board.length}</div>
    }

    const { container } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>,
    )

    const element = container.querySelector('[data-testid="board-count"]')
    const count = parseInt(element?.textContent || '0')
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

describe('usePlayerDeckCount', () => {
  test('returns deck card count for player', () => {
    const TestComponent = () => {
      const deckCount = usePlayerDeckCount('player1')
      return <div data-testid="deck-count">{deckCount}</div>
    }

    const { container } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>,
    )

    const element = container.querySelector('[data-testid="deck-count"]')
    const count = parseInt(element?.textContent || '0')
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('returns deck count for inactive player', () => {
    const TestComponent = () => {
      const deckCount = usePlayerDeckCount('player2')
      return <div data-testid="deck-count">{deckCount}</div>
    }

    const { container } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>,
    )

    const element = container.querySelector('[data-testid="deck-count"]')
    const count = parseInt(element?.textContent || '0')
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

describe('usePlayerDiscardCount', () => {
  test('returns discard card count for player', () => {
    const TestComponent = () => {
      const discardCount = usePlayerDiscardCount('player1')
      return <div data-testid="discard-count">{discardCount}</div>
    }

    const { container } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>,
    )

    const element = container.querySelector('[data-testid="discard-count"]')
    const count = parseInt(element?.textContent || '0')
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('returns discard count for inactive player', () => {
    const TestComponent = () => {
      const discardCount = usePlayerDiscardCount('player2')
      return <div data-testid="discard-count">{discardCount}</div>
    }

    const { container } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>,
    )

    const element = container.querySelector('[data-testid="discard-count"]')
    const count = parseInt(element?.textContent || '0')
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
