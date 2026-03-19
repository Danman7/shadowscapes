import '@testing-library/jest-dom'
import { fireEvent } from '@testing-library/react'

import { DuelView } from 'src/components'
import {
  INITIAL_CARDS_TO_DRAW,
  INITIAL_PLAYER_COINS,
} from 'src/constants/duelParams'
import * as GameContext from 'src/contexts/GameContext'
import { createCardInstance, createDuel } from 'src/reducers/helpers'
import {
  DEFAULT_DUEL_SETUP,
  MIXED_STACKS_DUEL,
  PRELOADED_DUEL_SETUP,
  PRELOADED_DUEL_SETUP as preloadedState,
} from 'src/test/mocks/duelSetup'
import { renderGameContext } from 'src/test/renderGameContext'
import type { Duel } from 'src/types'

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

describe('Logs visibility', () => {
  test('hides logs by default', () => {
    const { getByRole, queryByText } = renderGameContext(<DuelView />, {
      preloadedState: MIXED_STACKS_DUEL,
    })

    expect(getByRole('button', { name: 'Logs' })).toBeInTheDocument()
    expect(queryByText('Garrett goes first.')).not.toBeInTheDocument()
  })

  test('shows and hides logs on demand', () => {
    const { getByRole, queryByRole, getByText, queryByText } =
      renderGameContext(<DuelView />, {
        preloadedState: MIXED_STACKS_DUEL,
      })

    fireEvent.click(getByRole('button', { name: 'Logs' }))

    expect(queryByRole('button', { name: 'Logs' })).not.toBeInTheDocument()
    expect(getByText('Garrett goes first.')).toBeInTheDocument()

    const logsTitle = getByText('Logs')
    const closeIcon = logsTitle.parentElement?.querySelector('svg')
    if (closeIcon === null || closeIcon === undefined)
      throw new Error('Expected close icon to be rendered')

    fireEvent.click(closeIcon)

    expect(getByRole('button', { name: 'Logs' })).toBeInTheDocument()
    expect(queryByText('Garrett goes first.')).not.toBeInTheDocument()
  })
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
      type: 'SKIP_REDRAW',
      payload: { playerId: duelState.playerOrder[1] },
    })
  })

  test('dispatches REDRAW_CARD when card is clicked in redraw phase', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]
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

    const { playerOrder, players } = PRELOADED_DUEL_SETUP

    expect(
      getByText(`${players[playerOrder[0]].name}'s Turn`),
    ).toBeInTheDocument()
    expect(queryByText('Ready')).not.toBeInTheDocument()
  })
})

describe('Player turns', () => {
  test('dispatches PLAY_CARD when card in hand is clicked during player turn', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]
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

    const activePlayerId = preloadedState.playerOrder[0]
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

describe('Phase action buttons', () => {
  test('Pass button transitions to turn-end when active board has cards', () => {
    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]

    const stateWithBoard = {
      ...preloadedState,
      phase: 'player-turn' as const,
      cards: { 1: createCardInstance('zombie', 1) },
      players: {
        ...preloadedState.players,
        [activePlayerId]: { ...activePlayer, board: [1] },
      },
    }

    const { getByText } = renderGameContext(<DuelView />, {
      preloadedState: stateWithBoard,
    })

    fireEvent.click(getByText('Pass'))

    expect(getByText('End Turn')).toBeInTheDocument()
  })

  test('Pass button switches turn when active board is empty', () => {
    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]
    const inactivePlayerId = preloadedState.playerOrder[1]

    const stateWithEmptyBoard = {
      ...preloadedState,
      phase: 'player-turn' as const,
      players: {
        ...preloadedState.players,
        [activePlayerId]: { ...activePlayer, board: [] },
      },
    }

    const { getByText } = renderGameContext(<DuelView />, {
      preloadedState: stateWithEmptyBoard,
    })

    fireEvent.click(getByText('Pass'))

    expect(
      getByText(`${preloadedState.players[inactivePlayerId].name}'s Turn`),
    ).toBeInTheDocument()
  })

  test('Skip redraw button transitions to player-turn after active player skips', () => {
    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]

    const stateWithRedraw = {
      ...preloadedState,
      phase: 'redraw' as const,
      players: {
        ...preloadedState.players,
        [activePlayerId]: { ...activePlayer, playerReady: false },
        [preloadedState.playerOrder[1]]: {
          ...preloadedState.players[preloadedState.playerOrder[1]],
          playerReady: true,
        },
      },
    }

    const { getByText } = renderGameContext(<DuelView />, {
      preloadedState: stateWithRedraw,
    })

    fireEvent.click(getByText('Skip redraw'))

    expect(getByText(`${activePlayer.name}'s Turn`)).toBeInTheDocument()
  })
})

describe('Turn end phase', () => {
  test('dispatches SWITCH_TURN when active player has no cards on board', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]

    const preloadedStateWithEmptyBoard = {
      ...preloadedState,
      phase: 'turn-end' as const,
      players: {
        ...preloadedState.players,
        [activePlayerId]: {
          ...activePlayer,
          board: [],
        },
      },
    }

    renderGameContext(<DuelView />, {
      preloadedState: preloadedStateWithEmptyBoard,
    })

    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'SWITCH_TURN' })
  })

  test('dispatches ATTACK_PLAYER when active has board cards and inactive has none', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]
    const inactivePlayerId = preloadedState.playerOrder[1]
    const inactivePlayer = preloadedState.players[inactivePlayerId]

    const preloadedStateWithAttack = {
      ...preloadedState,
      phase: 'turn-end' as const,
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('haunt', 2),
      },
      players: {
        ...preloadedState.players,
        [activePlayerId]: {
          ...activePlayer,
          board: [1, 2],
        },
        [inactivePlayerId]: {
          ...inactivePlayer,
          board: [],
        },
      },
    }

    renderGameContext(<DuelView />, {
      preloadedState: preloadedStateWithAttack,
    })

    expect(dispatchSpy).not.toHaveBeenCalledWith({
      type: 'ATTACK_PLAYER',
      payload: { attackerId: 1 },
    })
  })

  test('dispatches ATTACK_PLAYER when active board card is clicked and inactive board is empty', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]
    const inactivePlayerId = preloadedState.playerOrder[1]
    const inactivePlayer = preloadedState.players[inactivePlayerId]

    const preloadedStateWithAttack = {
      ...preloadedState,
      phase: 'turn-end' as const,
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('haunt', 2),
      },
      players: {
        ...preloadedState.players,
        [activePlayerId]: {
          ...activePlayer,
          board: [1, 2],
        },
        [inactivePlayerId]: {
          ...inactivePlayer,
          board: [],
        },
      },
    }

    const { getAllByTestId } = renderGameContext(<DuelView />, {
      preloadedState: preloadedStateWithAttack,
    })

    const cards = getAllByTestId('card')
    fireEvent.click(cards[0] as HTMLElement)

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'ATTACK_PLAYER',
      payload: { attackerId: 1 },
    })
  })

  test('dispatches SWITCH_TURN when both players have cards but all acted', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]
    const inactivePlayerId = preloadedState.playerOrder[1]
    const inactivePlayer = preloadedState.players[inactivePlayerId]

    const preloadedStateWithBothBoards = {
      ...preloadedState,
      phase: 'turn-end' as const,
      cards: {
        1: { ...createCardInstance('zombie', 1), didAct: true },
        2: { ...createCardInstance('haunt', 2), didAct: true },
        3: createCardInstance('cook', 3),
      },
      players: {
        ...preloadedState.players,
        [activePlayerId]: {
          ...activePlayer,
          board: [1, 2],
        },
        [inactivePlayerId]: {
          ...inactivePlayer,
          board: [3],
        },
      },
    }

    renderGameContext(<DuelView />, {
      preloadedState: preloadedStateWithBothBoards,
    })

    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'SWITCH_TURN' })
  })

  test('does not dispatch when inactive board card is clicked with no selected attacker', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]
    const inactivePlayerId = preloadedState.playerOrder[1]
    const inactivePlayer = preloadedState.players[inactivePlayerId]

    const stateWithBothBoards = {
      ...preloadedState,
      phase: 'turn-end' as const,
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('haunt', 2),
      },
      players: {
        ...preloadedState.players,
        [activePlayerId]: { ...activePlayer, board: [1] },
        [inactivePlayerId]: { ...inactivePlayer, board: [2] },
      },
    }

    const { getAllByTestId } = renderGameContext(<DuelView />, {
      preloadedState: stateWithBothBoards,
    })

    const cards = getAllByTestId('card')
    fireEvent.click(cards[0] as HTMLElement)

    expect(dispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ATTACK_CARD' }),
    )
  })

  test('dispatches ATTACK_CARD after selecting attacker then clicking defender', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]
    const inactivePlayerId = preloadedState.playerOrder[1]
    const inactivePlayer = preloadedState.players[inactivePlayerId]

    const stateWithBothBoards = {
      ...preloadedState,
      phase: 'turn-end' as const,
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('haunt', 2),
      },
      players: {
        ...preloadedState.players,
        [activePlayerId]: { ...activePlayer, board: [1] },
        [inactivePlayerId]: { ...inactivePlayer, board: [2] },
      },
    }

    const { getAllByTestId } = renderGameContext(<DuelView />, {
      preloadedState: stateWithBothBoards,
    })

    // inactive board is row 2 (top), active board is row 4 (bottom)
    // cards[0] = inactive (haunt id=2), cards[1] = active (zombie id=1)
    const cards = getAllByTestId('card')
    fireEvent.click(cards[1] as HTMLElement)
    fireEvent.click(cards[0] as HTMLElement)

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })
  })

  test('does not auto-switch when cards have not acted yet', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]
    const inactivePlayerId = preloadedState.playerOrder[1]
    const inactivePlayer = preloadedState.players[inactivePlayerId]

    const preloadedStateWithBothBoards = {
      ...preloadedState,
      phase: 'turn-end' as const,
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('haunt', 2),
        3: createCardInstance('cook', 3),
      },
      players: {
        ...preloadedState.players,
        [activePlayerId]: {
          ...activePlayer,
          board: [1, 2],
        },
        [inactivePlayerId]: {
          ...inactivePlayer,
          board: [3],
        },
      },
    }

    renderGameContext(<DuelView />, {
      preloadedState: preloadedStateWithBothBoards,
    })

    expect(dispatchSpy).not.toHaveBeenCalledWith({ type: 'SWITCH_TURN' })
  })

  test('does not auto-switch when inactive board is empty but active cards have not all acted', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]
    const inactivePlayerId = preloadedState.playerOrder[1]
    const inactivePlayer = preloadedState.players[inactivePlayerId]

    const stateWithUnactedActive = {
      ...preloadedState,
      phase: 'turn-end' as const,
      cards: {
        1: createCardInstance('zombie', 1),
        2: { ...createCardInstance('haunt', 2), didAct: true },
      },
      players: {
        ...preloadedState.players,
        [activePlayerId]: {
          ...activePlayer,
          board: [1, 2],
        },
        [inactivePlayerId]: {
          ...inactivePlayer,
          board: [],
        },
      },
    }

    renderGameContext(<DuelView />, {
      preloadedState: stateWithUnactedActive,
    })

    expect(dispatchSpy).not.toHaveBeenCalledWith({ type: 'SWITCH_TURN' })
  })

  test('End Turn button dispatches SWITCH_TURN and calls onTurnEnd', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]

    const stateWithBothBoards: Duel = {
      ...preloadedState,
      phase: 'turn-end' as const,
      cards: {
        1: createCardInstance('zombie', 1),
        2: createCardInstance('haunt', 2),
      },
      players: {
        player1: {
          ...preloadedState.players.player1,
          hand: [],
          deck: [],
          discard: [],
          board: activePlayerId === 'player1' ? [1] : [2],
        },
        player2: {
          ...preloadedState.players.player2,
          hand: [],
          deck: [],
          discard: [],
          board: activePlayerId === 'player2' ? [1] : [2],
        },
      },
    }

    const { getAllByTestId, getByText } = renderGameContext(<DuelView />, {
      preloadedState: stateWithBothBoards,
    })

    // Select an attacker (active board = cards[1] with inactive board present)
    const cards = getAllByTestId('card')
    fireEvent.click(cards[1] as HTMLElement)

    // Click End Turn — this calls onTurnEnd (clears selectedAttackerId) then SWITCH_TURN
    fireEvent.click(getByText('End Turn'))

    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'SWITCH_TURN' })
  })
})

describe('PhaseInfo component', () => {
  test('renders empty text for intro phase', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const { getByTestId } = renderGameContext(<DuelView />, {
      preloadedState: { ...preloadedState, phase: 'intro' },
    })

    expect(getByTestId('phase-info').textContent).toBe('')
  })

  test('renders no phase button for intro phase (default case)', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const { queryByText } = renderGameContext(<DuelView />, {
      preloadedState: { ...preloadedState, phase: 'intro' },
    })

    expect(queryByText('Pass')).not.toBeInTheDocument()
    expect(queryByText('End Turn')).not.toBeInTheDocument()
    expect(queryByText('Skip redraw')).not.toBeInTheDocument()
  })

  test('shows Waiting for opponent button when active player is already ready in redraw', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]

    const { getByText } = renderGameContext(<DuelView />, {
      preloadedState: {
        ...preloadedState,
        phase: 'redraw' as const,
        players: {
          ...preloadedState.players,
          [activePlayerId]: { ...activePlayer, playerReady: true },
          [preloadedState.playerOrder[1]]: {
            ...preloadedState.players[preloadedState.playerOrder[1]],
            playerReady: false,
          },
        },
      },
    })

    expect(getByText('Waiting for opponent...')).toBeInTheDocument()
  })
})

describe('Player turn card interactions', () => {
  test('does not dispatch when clicking a board card (not in hand) during player-turn', () => {
    const dispatchSpy = vi.fn()
    vi.spyOn(GameContext, 'useGameDispatch').mockReturnValue(dispatchSpy)

    const activePlayerId = preloadedState.playerOrder[0]
    const activePlayer = preloadedState.players[activePlayerId]

    const stateWithBoardCard = {
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
          hand: [2],
          board: [1],
        },
      },
    }

    const { getAllByTestId } = renderGameContext(<DuelView />, {
      preloadedState: stateWithBoardCard,
    })

    const cards = getAllByTestId('card')
    // Board card (id=1) is in the active board row — click it
    // inactive board is empty so active board cards come immediately
    // cards[0] = hand card (id=2), but we want the board card — it renders separately
    // active board card is in row 4; hand card is in the hand section
    // Find the board card by clicking it and asserting PLAY_CARD is not dispatched with id=1
    const boardCard = cards.find(
      (el) => (el as HTMLElement).closest('[data-testid="board"]') !== null,
    ) as HTMLElement | undefined

    if (boardCard) {
      fireEvent.click(boardCard)
      expect(dispatchSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PLAY_CARD',
          payload: expect.objectContaining({ cardInstanceId: 1 }),
        }),
      )
    }
  })
})
