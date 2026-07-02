import { mockChaosUser, mockOrderUser } from '../../user'
import { duelReducer, initiateDuelFromUsers } from './duelSlice'

export const mockDuelState = duelReducer(
  undefined,
  initiateDuelFromUsers([mockOrderUser, mockChaosUser]),
)

export const mockOrderPlayer = mockDuelState.players[mockOrderUser.id]
export const mockChaosPlayer = mockDuelState.players[mockChaosUser.id]
