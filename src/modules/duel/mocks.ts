import { initialState } from 'src/modules/duel/reducer'
import { DuelState, PlayerStackSetup } from 'src/modules/duel/types'
import {
  convertUsersToDuelPlayersAndCards,
  setupPlayersAndCardsForTest,
} from 'src/modules/duel/utils'
import {
  mockChaosBot,
  mockLoadedUserState,
  mockOrderUser,
} from 'src/modules/user/mocks'

const { cards, players } = convertUsersToDuelPlayersAndCards([
  mockOrderUser,
  mockChaosBot,
])

export const mockInitializeDuelMockState: DuelState = {
  ...initialState,
  cards,
  players,
  activePlayerId: mockOrderUser.id,
  inactivePlayerId: mockChaosBot.id,
}

export const mockUserStackSetup: PlayerStackSetup = {
  id: mockLoadedUserState.user.id,
  name: mockLoadedUserState.user.name,
  deck: ['cook', 'elevatedAcolyte'],
  hand: ['hammeriteNovice', 'templeGuard', 'houseGuard'],
  board: ['brotherSachelman', 'highPriestMarkander'],
  discard: ['cook', 'elevatedAcolyte'],
}

export const mockOpponentStackSetup: PlayerStackSetup = {
  id: mockChaosBot.id,
  name: mockChaosBot.name,
  deck: ['zombie', 'cook'],
  hand: ['azaranTheCruel', 'bookOfAsh'],
  board: ['haunt', 'apparition'],
  discard: ['zombie', 'cook'],
}

const { cards: stackedCards, players: stackedPlayers } =
  setupPlayersAndCardsForTest([mockUserStackSetup, mockOpponentStackSetup])

export const mockStackedDuelState: DuelState = {
  ...mockInitializeDuelMockState,
  cards: stackedCards,
  players: stackedPlayers,
  phase: 'Player Turn',
}
