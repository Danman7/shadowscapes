import { initialState } from 'src/modules/duel/reducer'
import { DuelState, PlayerStackSetup } from 'src/modules/duel/types'
import {
  convertUsersToDuelPlayersAndCards,
  setupPlayersAndCardsForTest,
} from 'src/modules/duel/utils'
import {
  mockChaosUser,
  mockLoadedUserState,
  mockOrderUser,
} from 'src/modules/user/mocks'

const { cards, players } = convertUsersToDuelPlayersAndCards([
  mockOrderUser,
  mockChaosUser,
])

export const mockInitializeDuelMockState: DuelState = {
  ...initialState,
  cards,
  players,
  activePlayerId: mockOrderUser.id,
  inactivePlayerId: mockChaosUser.id,
}

export const mockUserStackSetup: PlayerStackSetup = {
  id: mockLoadedUserState.user.id,
  name: mockLoadedUserState.user.name,
  deck: ['hammeriteNovice', 'templeGuard', 'cook'],
  hand: ['hammeriteNovice', 'templeGuard'],
  board: ['brotherSachelman', 'highPriestMarkander'],
  discard: ['cook'],
}

export const mockOpponentStackSetup: PlayerStackSetup = {
  id: mockChaosUser.id,
  name: mockChaosUser.name,
  deck: ['zombie', 'bookOfAsh'],
  hand: ['azaranTheCruel'],
  board: ['haunt'],
  discard: ['zombie'],
}

const { cards: stackedCards, players: stackedPlayers } =
  setupPlayersAndCardsForTest([mockUserStackSetup, mockOpponentStackSetup])

export const mockStackedDuelState: DuelState = {
  ...mockInitializeDuelMockState,
  cards: stackedCards,
  players: stackedPlayers,
}
