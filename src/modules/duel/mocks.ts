import { initialState } from 'src/modules/duel/reducer'
import { DuelState } from 'src/modules/duel/types'
import { convertUsersToDuelPlayersAndCards } from 'src/modules/duel/utils'
import { mockChaosUser, mockOrderUser } from 'src/modules/user/mocks'

const [cards, players] = convertUsersToDuelPlayersAndCards([
  mockOrderUser,
  mockChaosUser,
])

export const initializeDuelMockState: DuelState = {
  ...initialState,
  cards,
  players,
  activePlayerId: mockOrderUser.id,
  inactivePlayerId: mockChaosUser.id,
}
