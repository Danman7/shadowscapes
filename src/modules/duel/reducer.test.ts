import { duelReducer, initialState } from 'src/modules/duel/reducer'
import {
  DuelAction,
  DuelStartingUsers,
  InitialiseDuelAction,
  ProgressToInitialDraw,
} from 'src/modules/duel/types'
import { mockChaosUser, mockOrderUser } from 'src/modules/user/mocks'

describe('Duel Reducer', () => {
  it('should return current state for unknown actions', () => {
    const action = { type: 'UNKNOWN_ACTION' } as unknown as DuelAction

    const newState = duelReducer(initialState, action)

    expect(newState).toBe(initialState)
  })

  it('should convert users to players and set activePlayerId when INITIALISE_DUEL is dispatched', () => {
    const users: DuelStartingUsers = [mockOrderUser, mockChaosUser]

    const action: InitialiseDuelAction = {
      type: 'INITIALISE_DUEL',
      users,
    }

    const { players, cards, activePlayerId, inactivePlayerId } = duelReducer(
      initialState,
      action,
    )

    expect(Object.values(cards)).toHaveLength(
      mockOrderUser.draftDeck.length + mockChaosUser.draftDeck.length,
    )

    users.forEach(({ id }) => {
      expect(players[id]).toBeDefined()
    })

    expect(users).toContainEqual(
      expect.objectContaining({ id: activePlayerId }),
    )
    expect(users).toContainEqual(
      expect.objectContaining({ id: inactivePlayerId }),
    )
  })

  it('should update phase when PROGRESS_TO_INITIAL_DRAW is dispatched', () => {
    const action: ProgressToInitialDraw = {
      type: 'PROGRESS_TO_INITIAL_DRAW',
    }

    const { phase } = duelReducer(initialState, action)

    expect(phase).toBe('Initial Draw')
  })
})
