import '@testing-library/jest-dom'
import { describe, expect, test } from 'vitest'

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
import { PRELOADED_DUEL_SETUP } from '@/test/mocks/duelSetup'
import { renderGameContext } from '@/test/mocks/testHelpers'
import type { Duel } from '@/types'

const preloadedState: Duel = {
  ...PRELOADED_DUEL_SETUP,
  activePlayerId: 'player1',
  inactivePlayerId: 'player2',
  phase: 'player-turn',
  startingPlayerId: 'player1',
  players: {
    ...PRELOADED_DUEL_SETUP.players,
    player1: {
      ...PRELOADED_DUEL_SETUP.players.player1,
      deckIds: [2],
      handIds: [1],
      boardIds: [5],
      discardIds: [],
    },
    player2: {
      ...PRELOADED_DUEL_SETUP.players.player2,
      deckIds: [4],
      handIds: [],
      boardIds: [],
      discardIds: [3],
    },
  },
}

describe('useDuelPhase', () => {
  test('returns current phase from game state', () => {
    const TestComponent = () => {
      const phase = useDuelPhase()
      return <div data-testid="phase">{phase}</div>
    }

    const { getByTestId } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const element = getByTestId('phase')
    expect(element?.textContent).toBe(preloadedState.phase)
  })
})

describe('useActivePlayer', () => {
  test('returns active player from game state', () => {
    const TestComponent = () => {
      const activePlayer = useActivePlayer()
      return <div data-testid="player-id">{activePlayer.id}</div>
    }

    const { getByTestId } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const element = getByTestId('player-id')
    expect(element?.textContent).toBe(preloadedState.activePlayerId)
  })
})

describe('useInactivePlayer', () => {
  test('returns inactive player from game state', () => {
    const TestComponent = () => {
      const inactivePlayer = useInactivePlayer()
      return <div data-testid="player-id">{inactivePlayer.id}</div>
    }

    const { getByTestId } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const element = getByTestId('player-id')
    expect(element?.textContent).toBe(preloadedState.inactivePlayerId)
  })
})

describe('usePlayerCards', () => {
  test('returns empty array when player has no cards in stack', () => {
    const TestComponent = () => {
      const cards = usePlayerCards('player1', 'hand')
      return <div data-testid="card-count">{cards.length}</div>
    }

    const emptyHandState: Partial<Duel> = {
      ...preloadedState,
      players: {
        ...preloadedState.players,
        player1: {
          ...preloadedState.players.player1,
          handIds: [],
        },
      },
    }

    const { getByTestId } = renderGameContext(<TestComponent />, {
      preloadedState: emptyHandState,
    })

    const element = getByTestId('card-count')
    expect(element?.textContent).toBe('0')
  })
})

describe('useActivePlayerHand', () => {
  test('returns active player hand cards', () => {
    const TestComponent = () => {
      const hand = useActivePlayerHand()
      return <div data-testid="hand-count">{hand.length}</div>
    }

    const { getByTestId } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const element = getByTestId('hand-count')
    expect(element?.textContent).toBe('1')
  })
})

describe('useActivePlayerBoard', () => {
  test('returns active player board cards', () => {
    const TestComponent = () => {
      const board = useActivePlayerBoard()
      return <div data-testid="board-count">{board.length}</div>
    }

    const { getByTestId } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const element = getByTestId('board-count')
    expect(element?.textContent).toBe('1')
  })
})

describe('useInactivePlayerBoard', () => {
  test('returns inactive player board cards', () => {
    const TestComponent = () => {
      const board = useInactivePlayerBoard()
      return <div data-testid="board-count">{board.length}</div>
    }

    const { getByTestId } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const element = getByTestId('board-count')
    expect(element?.textContent).toBe('0')
  })
})

describe('usePlayerDeckCount', () => {
  test('returns deck card count for player', () => {
    const TestComponent = () => {
      const deckCount = usePlayerDeckCount('player1')
      return <div data-testid="deck-count">{deckCount}</div>
    }

    const { getByTestId } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const element = getByTestId('deck-count')
    expect(element?.textContent).toBe('1')
  })

  test('returns deck count for inactive player', () => {
    const TestComponent = () => {
      const deckCount = usePlayerDeckCount('player2')
      return <div data-testid="deck-count">{deckCount}</div>
    }

    const { getByTestId } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const element = getByTestId('deck-count')
    expect(element?.textContent).toBe('1')
  })
})

describe('usePlayerDiscardCount', () => {
  test('returns discard card count for player', () => {
    const TestComponent = () => {
      const discardCount = usePlayerDiscardCount('player1')
      return <div data-testid="discard-count">{discardCount}</div>
    }

    const { getByTestId } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const element = getByTestId('discard-count')
    expect(element?.textContent).toBe('0')
  })

  test('returns discard count for inactive player', () => {
    const TestComponent = () => {
      const discardCount = usePlayerDiscardCount('player2')
      return <div data-testid="discard-count">{discardCount}</div>
    }

    const { getByTestId } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const element = getByTestId('discard-count')
    expect(element?.textContent).toBe('1')
  })
})
