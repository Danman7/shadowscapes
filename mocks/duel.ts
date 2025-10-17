import { mockChaosUser, mockOrderUser } from '@/mocks/users'
import { initialDuelState } from '@/state'
import { setInitialPlayersFromUserDecks } from '@/state/utils'
import { DuelState } from '@/types'

export const mockInitialDuelStateWithPlayers: DuelState = {
  ...initialDuelState,
  ...setInitialPlayersFromUserDecks([mockOrderUser, mockChaosUser]),
}
