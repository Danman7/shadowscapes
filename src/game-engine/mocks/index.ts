import { INITIAL_DUEL_STATE } from 'src/game-engine/constants'
import {
  PLAYER_1_GAME_DECK,
  PLAYER_1_TEST_DECK,
  PLAYER_2_GAME_DECK,
  PLAYER_2_TEST_DECK,
} from 'src/game-engine/constants/testDecks'
import {
  createCardInstance,
  createDuel,
  type CreateDuelParams,
} from 'src/game-engine/cards'
import { makeTestDuelState } from 'src/game-engine/mocks/builders'
import type { Duel, PlayerSetup } from 'src/game-engine/types'
import { formatString, messages } from 'src/i18n'

export {
  makeTestCard,
  makeTestCards,
  makeTestDuelState,
  makeTestPlayer,
} from 'src/game-engine/mocks/builders'
export const MOCK_PLAYER_1_SETUP: PlayerSetup = {
  id: 'player1',
  name: 'Constantine',
  deck: PLAYER_1_TEST_DECK,
}

export const MOCK_PLAYER_2_SETUP: PlayerSetup = {
  id: 'player2',
  name: 'Garrett',
  deck: PLAYER_2_TEST_DECK,
}

export const MOCK_DUEL_SETUP: CreateDuelParams = [
  MOCK_PLAYER_1_SETUP,
  MOCK_PLAYER_2_SETUP,
]

export const MOCK_DUEL = createDuel(MOCK_DUEL_SETUP)

export const GAME_DUEL = createDuel([
  { id: 'player1', name: 'Constantine', deck: PLAYER_1_GAME_DECK },
  { id: 'player2', name: 'Garrett', deck: PLAYER_2_GAME_DECK },
])

export const MOCK_LOGS: string[] = [
  formatString(messages.reducer.goesFirst, { playerName: 'Garrett' }),
  formatString(messages.reducer.skipRedraw, { playerName: 'Constantine' }),
  formatString(messages.reducer.redrawCard, { playerName: 'Garrett' }),
  formatString(messages.reducer.playCard, {
    playerName: 'Garrett',
    cardName: 'Temple Guard',
    cost: 4,
    remaining: 26,
  }),
  formatString(messages.reducer.attackPlayer, {
    attackerName: 'Temple Guard',
    playerName: 'Constantine',
    coins: 29,
  }),
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
  ...makeTestDuelState(),
  ...overrides,
})
