import { DuelPhases, initialDuelState } from '@/state/duelConstants'
import { duelReducer } from '@/state/duelReducer'
import { DuelAction, StartInitialDrawAction } from '@/types'

it('should return current state for unknown actions', () => {
  const action = { type: 'UNKNOWN_ACTION' } as unknown as DuelAction

  const newState = duelReducer(initialDuelState, action)

  expect(newState).toBe(initialDuelState)
})

it('should handle START_INITIAL_DRAW action', () => {
  const action: StartInitialDrawAction = { type: 'START_INITIAL_DRAW' }

  const newState = duelReducer(initialDuelState, action)

  expect(newState).toEqual({
    ...initialDuelState,
    phase: DuelPhases.InitialDraw,
  })
})
