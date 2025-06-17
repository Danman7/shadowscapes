import { initialState } from 'src/modules/user/reducer'
import { User, UserState } from 'src/modules/user/types'

export const mockOrderUser: User = {
  id: 'player',
  name: 'Garrett',
  draftDeck: [
    'hammeriteNovice',
    'hammeriteNovice',
    'templeGuard',
    'templeGuard',
    'brotherSachelman',
    'cook',
    'highPriestMarkander',
  ],
}

export const mockChaosUser: User = {
  id: 'opponent',
  name: 'The Trickster',
  draftDeck: ['zombie', 'zombie', 'haunt', 'haunt', 'azaranTheCruel'],
}

export const mockLoadedUserState: UserState = {
  ...initialState,
  user: mockOrderUser,
  isUserLoaded: true,
}
