import '@testing-library/jest-dom'
import { fireEvent } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { DuelView } from '@/components/DuelView'
import { CARD_BASES } from '@/constants/cardBases'
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
        board: [],
      },
    },
  }

  const { getAllByTestId } = renderGameContext(<DuelView />, {
    preloadedState: preloadedStateWithHand,
  })

  expect(cardInstanceId).not.toBeUndefined()

  const board = getAllByTestId('board')[1]
  const initialBoardCards = board?.querySelectorAll('[data-testid="card"]')
  expect(initialBoardCards).toHaveLength(0)

  const cards = getAllByTestId('card')
  fireEvent.click(cards[0] as HTMLElement)

  if (cardInstanceId === undefined) {
    throw new Error(
      'Expected a cardInstanceId to exist in the active player deck',
    )
  }

  const cardInstance = preloadedStateWithHand.cards[cardInstanceId]
  if (!cardInstance) {
    throw new Error(`Missing card instance for id: ${cardInstanceId}`)
  }

  const cardBase = CARD_BASES[cardInstance.baseId]

  const updatedBoard = getAllByTestId('board')[1]
  const boardCardsAfterPlay = updatedBoard?.querySelectorAll(
    '[data-testid="card"]',
  )
  expect(boardCardsAfterPlay).toHaveLength(1)
  expect(updatedBoard?.textContent).toContain(cardBase.name)
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
