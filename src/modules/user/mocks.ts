import { User } from 'src/modules/user/types'

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
