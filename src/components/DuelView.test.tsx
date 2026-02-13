import '@testing-library/jest-dom'
import { fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { DuelView } from '@/components/DuelView'
import {
  INITIAL_CARDS_TO_DRAW,
  INITIAL_PLAYER_COINS,
} from '@/constants/duelParams'
import * as GameContext from '@/contexts/GameContext'
import { createDuel } from '@/game-engine/initialization'
import { createCardInstance } from '@/game-engine/utils'
import {
  DEFAULT_DUEL_SETUP,
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

describe('Initial sequence', () => {
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

  test('sets inactive player as ready during redraw phase', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const deterministicSetup = {
      ...DEFAULT_DUEL_SETUP,
    }
    const duelState = {
      ...PRELOADED_DUEL_SETUP,
      ...createDuel(deterministicSetup, { rng: () => 0.6 }),
      phase: 'redraw' as const,
    }

    renderGameContext(<DuelView />, {
      preloadedState: duelState,
    })

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'PLAYER_READY',
      payload: { playerId: duelState.inactivePlayerId },
    })
  })

  test('dispatches REDRAW_CARD when card is clicked in redraw phase', () => {
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

    const preloadedStateWithRedraw = {
      ...preloadedState,
      phase: 'redraw' as const,
      players: {
        ...preloadedState.players,
        [activePlayerId]: {
          ...activePlayer,
          hand: [cardInstanceId],
          deck: [2, 3],
        },
      },
    }

    const { getAllByTestId } = renderGameContext(<DuelView />, {
      preloadedState: preloadedStateWithRedraw,
    })

    const cards = getAllByTestId('card')
    fireEvent.click(cards[0] as HTMLElement)

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'REDRAW_CARD',
      payload: {
        playerId: activePlayerId,
        cardInstanceId,
      },
    })
  })

  test('transitions to active player turn after both players are ready in redraw phase', () => {
    const { getByText, queryByText } = renderGameContext(<DuelView />, {
      preloadedState: {
        ...PRELOADED_DUEL_SETUP,
        phase: 'redraw',
        players: {
          player1: {
            ...PRELOADED_DUEL_SETUP.players.player1,
            playerReady: true,
          },
          player2: {
            ...PRELOADED_DUEL_SETUP.players.player2,
            playerReady: true,
          },
        },
      },
    })

    const { activePlayerId, players } = PRELOADED_DUEL_SETUP

    expect(
      getByText(`${players[activePlayerId].name}'s Turn`),
    ).toBeInTheDocument()
    expect(queryByText('Ready')).not.toBeInTheDocument()
  })
})

describe('Player turns', () => {
  test('dispatches PLAY_CARD when card in hand is clicked during player turn', () => {
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
      phase: 'player-turn' as const,
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

  test('only allows clicking affordable cards during player-turn', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.activePlayerId
    const activePlayer = preloadedState.players[activePlayerId]

    const preloadedStateWithBudget = {
      ...preloadedState,
      phase: 'player-turn' as const,
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('haunt', 2),
      },
      players: {
        ...preloadedState.players,
        [activePlayerId]: {
          ...activePlayer,
          coins: 2,
          hand: [1, 2],
          board: [],
        },
      },
    }

    const { getAllByTestId, container } = renderGameContext(<DuelView />, {
      preloadedState: preloadedStateWithBudget,
    })

    const handCards = container.querySelectorAll('.hand-card')
    expect(handCards[0]).toHaveClass('is-clickable')
    expect(handCards[1]).not.toHaveClass('is-clickable')

    const cards = getAllByTestId('card')
    fireEvent.click(cards[0] as HTMLElement)

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'PLAY_CARD',
      payload: {
        playerId: activePlayerId,
        cardInstanceId: 1,
      },
    })

    dispatchSpy.mockClear()
    fireEvent.click(cards[1] as HTMLElement)
    expect(dispatchSpy).not.toHaveBeenCalled()
  })
})
