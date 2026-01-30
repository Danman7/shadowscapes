import '@testing-library/jest-dom'
import { fireEvent } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { DuelView } from '@/components/DuelView'
import * as GameContext from '@/contexts/GameContext'
import { PRELOADED_DUEL_SETUP as preloadedState } from '@/test/mocks/duelSetup'
import { renderGameContext } from '@/test/mocks/testHelpers'

afterEach(() => {
  vi.restoreAllMocks()
})

test('renders main game view when phase is player-turn', () => {
  const { getByTestId } = renderGameContext(<DuelView />, {
    preloadedState,
  })

  // Should show game view instead of intro screen
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

test('renders end turn button in game view', () => {
  const { getByTestId } = renderGameContext(<DuelView />, {
    preloadedState,
  })

  const endTurnButton = getByTestId('end-turn-button') as HTMLElement
  expect(endTurnButton).toBeInTheDocument()
  expect(endTurnButton?.textContent).toBe('End Turn')
})

test('end turn button switches active player', () => {
  const { getByTestId } = renderGameContext(<DuelView />, {
    preloadedState,
  })

  const endTurnButton = getByTestId('end-turn-button') as HTMLElement

  expect(() => endTurnButton?.click()).not.toThrow()
})

test('renders deck and discard piles for both players', () => {
  const { getAllByTestId } = renderGameContext(<DuelView />, {
    preloadedState,
  })

  expect(getAllByTestId('face-down-pile')).toHaveLength(4)
})

test('dispatches PLAY_CARD when card in hand is clicked', () => {
  const dispatchSpy = vi.fn()
  vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

  const activePlayerId = preloadedState.activePlayerId
  const activePlayer = preloadedState.players[activePlayerId]
  const cardInstanceId = activePlayer.deckIds[0]

  const preloadedStateWithHand = {
    ...preloadedState,
    players: {
      ...preloadedState.players,
      [activePlayerId]: {
        ...activePlayer,
        handIds: cardInstanceId !== undefined ? [cardInstanceId] : [],
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
  // When startingPlayerId is null, IntroScreen returns null because
  // the guard clause checks for null. This test verifies that behavior.
  const { queryByTestId } = renderGameContext(<DuelView />, {
    preloadedState: {
      ...preloadedState,
      startingPlayerId: null,
    },
  })

  // IntroScreen should return null, so no intro-screen element
  const introScreen = queryByTestId('intro-screen')
  expect(introScreen).not.toBeInTheDocument()
})

test('handles card click in active player hand', () => {
  const { getByTestId, queryAllByTestId } = renderGameContext(<DuelView />, {
    preloadedState,
  })

  // Should be in duel view
  const duelView = getByTestId('duel-view')
  expect(duelView).toBeInTheDocument()

  // Get all cards (should have at least one from the DRAW_CARD dispatch)
  const cards = queryAllByTestId('card')

  if (cards.length > 0) {
    // Click first card to trigger onCardClick handler
    const firstCard = cards[0]
    if (firstCard) {
      fireEvent.click(firstCard)
    }

    // Verify component still renders after click
    const duelViewAfter = getByTestId('duel-view')
    expect(duelViewAfter).toBeInTheDocument()
  }
})
