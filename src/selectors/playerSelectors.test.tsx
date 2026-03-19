import '@testing-library/jest-dom'

import { Board, Hand } from 'src/components'
import { CARD_BASES } from 'src/constants/cardBases'
import {
  useActivePlayer,
  useActivePlayerBoard,
  useActivePlayerHand,
  useDuelPhase,
  useInactivePlayer,
  useInactivePlayerBoard,
  useInactivePlayerHand,
  usePlayerDeckCount,
  usePlayerDiscardCount,
} from 'src/selectors/playerSelectors'
import { MIXED_STACKS_DUEL as preloadedState } from 'src/test/mocks/duelSetup'
import { renderGameContext } from 'src/test/renderGameContext'

describe('useDuelPhase', () => {
  test('returns current phase from game state', () => {
    const TestComponent = () => useDuelPhase()

    const { getByText } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    expect(getByText(preloadedState.phase)).toBeInTheDocument()
  })
})

describe('useActivePlayer', () => {
  test('returns active player from game state', () => {
    const TestComponent = () => {
      const { id, name } = useActivePlayer()
      return (
        <>
          <div>{id}</div>

          <div>{name}</div>
        </>
      )
    }

    const { getByText } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    expect(getByText(preloadedState.playerOrder[0])).toBeInTheDocument()
    expect(
      getByText(preloadedState.players[preloadedState.playerOrder[0]].name),
    ).toBeInTheDocument()
  })
})

describe('useInactivePlayer', () => {
  test('returns active player from game state', () => {
    const TestComponent = () => {
      const { id, name } = useInactivePlayer()
      return (
        <>
          <div>{id}</div>

          <div>{name}</div>
        </>
      )
    }

    const { getByText } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    expect(getByText(preloadedState.playerOrder[1])).toBeInTheDocument()
    expect(
      getByText(preloadedState.players[preloadedState.playerOrder[1]].name),
    ).toBeInTheDocument()
  })
})

describe('useActivePlayerHand', () => {
  test('returns active player hand cards', () => {
    const TestComponent = () => <Hand cards={useActivePlayerHand()} isActive />

    const { getAllByTestId, getByText } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const stateHand = preloadedState.players[preloadedState.playerOrder[0]].hand

    expect(getAllByTestId('card')).toHaveLength(stateHand.length)

    stateHand.forEach((cardId) => {
      expect(
        getByText(CARD_BASES[preloadedState.cards[cardId]!.baseId].name),
      ).toBeInTheDocument()
    })
  })
})

describe('useInactivePlayerHand', () => {
  test('returns active player hand cards', () => {
    const TestComponent = () => <Hand cards={useInactivePlayerHand()} />

    const { getAllByTestId } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const stateHand = preloadedState.players[preloadedState.playerOrder[1]].hand

    expect(getAllByTestId('card-back')).toHaveLength(stateHand.length)
  })
})

describe('useActivePlayerBoard', () => {
  test('returns active player board cards', () => {
    const TestComponent = () => <Board cards={useActivePlayerBoard()} />

    const { getAllByTestId, getByText } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const stateHand =
      preloadedState.players[preloadedState.playerOrder[0]].board

    expect(getAllByTestId('card')).toHaveLength(stateHand.length)

    stateHand.forEach((cardId) => {
      expect(
        getByText(CARD_BASES[preloadedState.cards[cardId]!.baseId].name),
      ).toBeInTheDocument()
    })
  })
})

describe('useInactivePlayerBoard', () => {
  test('returns active player board cards', () => {
    const TestComponent = () => <Board cards={useInactivePlayerBoard()} />

    const { getAllByTestId, getByText } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    const stateHand =
      preloadedState.players[preloadedState.playerOrder[1]].board

    expect(getAllByTestId('card')).toHaveLength(stateHand.length)

    stateHand.forEach((cardId) => {
      expect(
        getByText(CARD_BASES[preloadedState.cards[cardId]!.baseId].name),
      ).toBeInTheDocument()
    })
  })
})

describe('usePlayerDeckCount', () => {
  test('returns deck card count for player', () => {
    const TestComponent = () => usePlayerDeckCount('player1')

    const { getByText } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    expect(getByText(preloadedState.players['player1'].deck.length.toString()))
      .toBeInTheDocument
  })
})

describe('usePlayerDiscardCount', () => {
  test('returns discard card count for player', () => {
    const TestComponent = () => usePlayerDiscardCount('player1')

    const { getByText } = renderGameContext(<TestComponent />, {
      preloadedState,
    })

    expect(
      getByText(preloadedState.players['player1'].discard.length.toString()),
    ).toBeInTheDocument
  })
})
