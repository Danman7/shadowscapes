import '@testing-library/jest-dom'
import { fireEvent } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { DuelView } from '@/components/DuelView'
import {
  INITIAL_CARDS_TO_DRAW,
  INITIAL_PLAYER_COINS,
} from '@/constants/duelParams'
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

test('displays player info in game view', () => {
  const { getByText, getAllByText } = renderGameContext(<DuelView />, {
    preloadedState,
  })

  expect(getByText(preloadedState.players.player1.name)).toBeInTheDocument()
  expect(getByText(preloadedState.players.player2.name)).toBeInTheDocument()
  expect(getAllByText(INITIAL_PLAYER_COINS)).toHaveLength(2)
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

  if (cardInstanceId === undefined) {
    throw new Error(
      'Expected a cardInstanceId to exist in the active player deck',
    )
  }

  const preloadedStateWithHand = {
    ...preloadedState,
    players: {
      ...preloadedState.players,
      [activePlayerId]: {
        ...activePlayer,
        hand: [cardInstanceId],
        board: [],
      },
    },
  }

  const { getAllByTestId } = renderGameContext(<DuelView />, {
    preloadedState: preloadedStateWithHand,
  })

  const cards = getAllByTestId('card')
  fireEvent.click(cards[0] as HTMLElement)

  expect(dispatchSpy).toHaveBeenCalledWith({
    type: 'PLAY_CARD',
    payload: {
      playerId: activePlayerId,
      cardInstanceId,
    },
  })
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
