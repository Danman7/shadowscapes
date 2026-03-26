import {
  INITIAL_DUEL_STATE,
  PLACEHOLDER_PLAYER,
  PLAYER_1_DECK,
  PLAYER_2_DECK,
} from 'src/game-engine/constants'
import {
  createCardInstance,
  createDuel,
  type CreateDuelParams,
} from 'src/game-engine/helpers'
import type { Duel, Player, PlayerSetup } from 'src/game-engine/types'

export const MOCK_PLAYER_1_SETUP: PlayerSetup = {
  id: 'player1',
  name: 'Constantine',
  deck: PLAYER_1_DECK,
}

export const MOCK_PLAYER_2_SETUP: PlayerSetup = {
  id: 'player2',
  name: 'Garrett',
  deck: PLAYER_2_DECK,
}

export const MOCK_DUEL_SETUP: CreateDuelParams = [
  MOCK_PLAYER_1_SETUP,
  MOCK_PLAYER_2_SETUP,
]

export const MOCK_DUEL = createDuel(MOCK_DUEL_SETUP)

export const MOCK_LOGS: string[] = [
  'Garrett goes first.',
  'Constantine skipped redraw.',
  'Garrett redrew a card.',
  'Garrett played Temple Guard for 4 coins. Garrett has 26 coins left.',
  'Temple Guard attacked Constantine. Constantine has 29 coins left.',
]

export const MIXED_STACKS_DUEL: Duel = {
  ...INITIAL_DUEL_STATE,
  phase: 'player-turn',
  playerOrder: ['player1', 'player2'],
  cards: {
    zombie1: createCardInstance('zombie', 'zombie1'),
    zombie2: createCardInstance('zombie', 'zombie2'),
    haunt1: createCardInstance('haunt', 'haunt1'),
    haunt2: createCardInstance('haunt', 'haunt2'),
    cook1: createCardInstance('cook', 'cook1'),
    cook2: createCardInstance('cook', 'cook2'),
    bookOfAsh: createCardInstance('bookOfAsh', 'bookOfAsh'),
    burrick: createCardInstance('burrick', 'burrick'),
    novice1: createCardInstance('novice', 'novice1'),
    novice2: createCardInstance('novice', 'novice2'),
    templeGuard1: createCardInstance('templeGuard', 'templeGuard1'),
    templeGuard2: createCardInstance('templeGuard', 'templeGuard2'),
    sachelman: createCardInstance('sachelman', 'sachelman'),
    yoraSkull: createCardInstance('yoraSkull', 'yoraSkull'),
    markander: createCardInstance('markander', 'markander'),
  },
  players: {
    player1: {
      ...MOCK_DUEL.players.player1,
      hand: ['zombie1', 'haunt1'],
      board: ['zombie2', 'haunt2'],
      discard: ['cook1'],
      deck: ['bookOfAsh', 'burrick'],
    },
    player2: {
      ...MOCK_DUEL.players.player2,
      hand: ['novice1', 'templeGuard1'],
      board: ['novice2', 'templeGuard2'],
      discard: ['sachelman', 'yoraSkull', 'markander'],
      deck: ['cook2'],
    },
  },
  logs: MOCK_LOGS,
}

export const makeTestDuel = (overrides: Partial<Duel> = {}): Duel => ({
  ...INITIAL_DUEL_STATE,
  playerOrder: ['player1', 'player2'],
  players: {
    player1: { ...PLACEHOLDER_PLAYER, id: 'player1', name: 'Alice' } as Player,
    player2: { ...PLACEHOLDER_PLAYER, id: 'player2', name: 'Bob' } as Player,
  },
  ...overrides,
})
