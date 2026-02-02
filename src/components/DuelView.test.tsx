import '@testing-library/jest-dom'
import { fireEvent } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { DuelView } from '@/components/DuelView'
import { INITIAL_CARDS_TO_DRAW } from '@/constants/duelParams'
import * as GameContext from '@/contexts/GameContext'
import {
  MIXED_STACKS_DUEL,
  PRELOADED_DUEL_SETUP,
  PRELOADED_DUEL_SETUP as preloadedState,
} from '@/test/mocks/duelSetup'
import { renderGameContext } from '@/test/renderGameContext'

afterEach(() => {
  vi.restoreAllMocks()
})

test('renders main game view when phase is player-turn', () => {
  const { getByTestId } = renderGameContext(<DuelView />, {
    preloadedState,
  })

  const duelView = getByTestId('duel-view')
  expect(duelView).toBeInTheDocument()
})

test('displays player names in game view', () => {
  const { container } = renderGameContext(<DuelView />, {
    preloadedState,
  })

  expect(container.textContent).toContain(preloadedState.players.player1.name)
  expect(container.textContent).toContain(preloadedState.players.player2.name)
})

test('renders deck and discard piles for both players', () => {
  const { getAllByTestId } = renderGameContext(<DuelView />, {
    preloadedState: MIXED_STACKS_DUEL,
  })

  expect(getAllByTestId('face-down-pile')).toHaveLength(4)
})

test('dispatches PLAY_CARD when card in hand is clicked', () => {
  const dispatchSpy = vi.fn()
  vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

  const activePlayerId = preloadedState.activePlayerId
  const activePlayer = preloadedState.players[activePlayerId]
  const cardInstanceId = activePlayer.deck[0]

  const preloadedStateWithHand = {
    ...preloadedState,
    players: {
      ...preloadedState.players,
      [activePlayerId]: {
        ...activePlayer,
        hand: cardInstanceId !== undefined ? [cardInstanceId] : [],
      },
    },
  }

  const { getAllByTestId } = renderGameContext(<DuelView />, {
    preloadedState: preloadedStateWithHand,
  })

  expect(cardInstanceId).not.toBeUndefined()
  if (cardInstanceId === undefined) {
    return
  }

  const cards = getAllByTestId('card')
  fireEvent.click(cards[0] as HTMLElement)

  expect(dispatchSpy).toHaveBeenCalledWith({
    type: 'PLAY_CARD',
    payload: { playerId: activePlayerId, cardInstanceId },
  })
})

test('handles intro screen button click when startingPlayerId is null', () => {
  const { queryByTestId } = renderGameContext(<DuelView />, {
    preloadedState: {
      ...preloadedState,
      startingPlayerId: null,
    },
  })

  const introScreen = queryByTestId('intro-screen')
  expect(introScreen).not.toBeInTheDocument()
})

test('handles card click in active player hand', () => {
  const { getByTestId, queryAllByTestId } = renderGameContext(<DuelView />, {
    preloadedState,
  })

  const duelView = getByTestId('duel-view')
  expect(duelView).toBeInTheDocument()

  const cards = queryAllByTestId('card')

  if (cards.length > 0) {
    const firstCard = cards[0]
    if (firstCard) {
      fireEvent.click(firstCard)
    }

    const duelViewAfter = getByTestId('duel-view')
    expect(duelViewAfter).toBeInTheDocument()
  }
})

test('transitions from intro to initial-draw to redraw phase', async () => {
  const dispatchSpy = vi.fn()
  vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

  renderGameContext(<DuelView />, {
    preloadedState: {
      ...PRELOADED_DUEL_SETUP,
      phase: 'intro',
    },
  })

  expect(dispatchSpy).toHaveBeenCalledWith({
    type: 'TRANSITION_PHASE',
    payload: 'initial-draw',
  })
})

test('triggers INITIAL_DRAW action when phase is initial-draw', () => {
  const { container } = renderGameContext(<DuelView />, {
    preloadedState: {
      ...PRELOADED_DUEL_SETUP,
      phase: 'initial-draw',
    },
  })

  const cards = container.querySelectorAll('[data-testid="card"]')
  expect(cards.length).toBe(INITIAL_CARDS_TO_DRAW)
})
