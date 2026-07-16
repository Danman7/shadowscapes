import { setupMockedDuel } from '../../user'
import type { UserDeck } from '../../user'
import {
  formatRandomAiDuelBatchMarkdown,
  getPlayerBoardLife,
  getRandomAiDuelStopReason,
  getRandomAiDuelWinner,
  simulateRandomAiDuel,
  simulateRandomAiDuelBatch,
} from './randomAiDuelSimulator'
import type { SimulationPlayerLabels } from './randomAiDuelSimulator'

const characterDeck: UserDeck = [
  'novice',
  'novice',
  'novice',
  'acolyte',
  'acolyte',
  'templeGuard',
  'templeGuard',
]

const chaosDeck: UserDeck = [
  'zombie',
  'zombie',
  'zombie',
  'burrick',
  'burrick',
  'haunt',
  'haunt',
]

const deckLabels = {
  player1: 'Order Hammerites',
  player2: 'Chaos Undead + Burricks',
} satisfies SimulationPlayerLabels

test('simulated duel batches are deterministic for the same seed', () => {
  const first = simulateRandomAiDuelBatch({
    decks: [characterDeck, chaosDeck],
    runs: 2,
    seed: 'repeatable',
    maxSteps: 100,
  })
  const second = simulateRandomAiDuelBatch({
    decks: [characterDeck, chaosDeck],
    runs: 2,
    seed: 'repeatable',
    maxSteps: 100,
  })

  expect(second).toEqual(first)
})

test('simulated duel batches default to one hundred runs', () => {
  const result = simulateRandomAiDuelBatch({
    decks: [[], []],
    seed: 'default-runs',
  })

  expect(result.runs).toBe(100)
  expect(result.duels).toHaveLength(100)
})

test('labels simulation players with deck identities', () => {
  const result = simulateRandomAiDuel({
    decks: [characterDeck, chaosDeck],
    playerLabels: deckLabels,
    seed: 'labels',
    maxSteps: 20,
  })

  expect(result.playerLabels).toEqual(deckLabels)
  expect(result.finalPlayers.player1.name).toBe('Order Hammerites')
  expect(result.finalPlayers.player2.name).toBe('Chaos Undead + Burricks')
})

test('stops immediately when both decks are empty', () => {
  const result = simulateRandomAiDuel({
    decks: [[], []],
    seed: 'empty',
    maxSteps: 20,
  })

  expect(result.outcomeReason).toBe('decks-empty')
  expect(result.steps).toBe(0)
  expect(result.events).toEqual([
    expect.objectContaining({ type: 'end', reason: 'decks-empty' }),
  ])
})

test('detects coin-zero stop state', () => {
  const state = setupMockedDuel()

  state.players[state.playerOrder[0]].coins = 0

  expect(getRandomAiDuelStopReason(state)).toBe('coin-zero')
})

test('uses coin depletion before secondary simulation conditions', () => {
  const finalPlayers = structuredClone(
    simulateRandomAiDuel({ decks: [[], []], seed: 'primary-winner' })
      .finalPlayers,
  )

  finalPlayers.player1.coins = 0
  finalPlayers.player1.boardLife = 20
  finalPlayers.player2.coins = 1
  finalPlayers.player2.boardLife = 0

  expect(getRandomAiDuelWinner(finalPlayers, 'coin-zero')).toEqual({
    winner: 'player2',
    winCondition: 'coin-zero',
  })
})

test('ties when both players deplete their coins', () => {
  const finalPlayers = structuredClone(
    simulateRandomAiDuel({ decks: [[], []], seed: 'double-depleted' })
      .finalPlayers,
  )

  finalPlayers.player1.coins = 0
  finalPlayers.player2.coins = 0

  expect(getRandomAiDuelWinner(finalPlayers, 'coin-zero')).toEqual({
    winner: 'tie',
    winCondition: 'tie',
  })
})

test('uses remaining coins, then board life, then a tie for secondary outcomes', () => {
  const basePlayers = simulateRandomAiDuel({
    decks: [[], []],
    seed: 'secondary-winners',
  }).finalPlayers
  const coinPlayers = structuredClone(basePlayers)
  const boardLifePlayers = structuredClone(basePlayers)

  coinPlayers.player1.coins = 4
  coinPlayers.player1.boardLife = 0
  coinPlayers.player2.coins = 3
  coinPlayers.player2.boardLife = 20
  boardLifePlayers.player1.boardLife = 2
  boardLifePlayers.player2.boardLife = 5

  expect(getRandomAiDuelWinner(coinPlayers, 'decks-empty')).toEqual({
    winner: 'player1',
    winCondition: 'coins-left',
  })
  expect(getRandomAiDuelWinner(boardLifePlayers, 'decks-empty')).toEqual({
    winner: 'player2',
    winCondition: 'board-life',
  })
  expect(getRandomAiDuelWinner(basePlayers, 'max-steps')).toEqual({
    winner: 'tie',
    winCondition: 'tie',
  })
})

test('counts only current character life as board presence', () => {
  const state = setupMockedDuel({
    activePlayer: { board: ['templeGuard', 'yoraSkull'] },
  })
  const player = state.players[state.playerOrder[0]]
  const character = state.cards[player.board[0]]

  if (character.type !== 'character') throw new Error('Expected a character')

  character.life = 5

  expect(getPlayerBoardLife(state, player)).toBe(5)
})

test('stops at max steps when no other stop condition is met', () => {
  const result = simulateRandomAiDuel({
    decks: [characterDeck, chaosDeck],
    seed: 'max-step',
    maxSteps: 0,
  })

  expect(result.outcomeReason).toBe('max-steps')
  expect(result.steps).toBe(0)
})

test('logs play and attack events for analysis', () => {
  const result = simulateRandomAiDuel({
    decks: [characterDeck, chaosDeck],
    seed: 'events',
    maxSteps: 200,
  })
  const eventTypes = result.events.map((event) => event.type)

  expect(eventTypes).toContain('draw')
  expect(eventTypes).toContain('play')
  expect(eventTypes).toContain('attack')
  expect(eventTypes.at(-1)).toBe('end')
  expect(
    Object.values(result.playedCards.player1).reduce(
      (sum, amount) => sum + (amount ?? 0),
      0,
    ) +
      Object.values(result.playedCards.player2).reduce(
        (sum, amount) => sum + (amount ?? 0),
        0,
      ),
  ).toBeGreaterThan(0)
})

test('logs target events when a random AI plays a targeted card', () => {
  const targetDeck: UserDeck = [
    'novice',
    'novice',
    'novice',
    'novice',
    'yoraSkull',
    'yoraSkull',
    'yoraSkull',
    'yoraSkull',
  ]
  const result = simulateRandomAiDuel({
    decks: [targetDeck, targetDeck],
    seed: 'targets',
    maxSteps: 200,
  })

  expect(result.events.map((event) => event.type)).toContain('target')
})

test('uses preferred play, target, and attack candidates during simulation', () => {
  const result = simulateRandomAiDuel({
    decks: [
      [
        'novice',
        'novice',
        'novice',
        'templeGuard',
        'templeGuard',
        'templeGuard',
        'acolyte',
        'acolyte',
        'acolyte',
        'yoraSkull',
      ],
      [
        'zombie',
        'zombie',
        'zombie',
        'burrick',
        'burrick',
        'haunt',
        'haunt',
        'haunt',
        'bookOfAsh',
        'bookOfAsh',
      ],
    ],
    seed: 'integration',
    maxSteps: 300,
  })
  const chaosRoundFiveAttacks = result.events.filter(
    (event) =>
      event.type === 'attack' &&
      event.playerKey === 'player2' &&
      event.round === 5,
  )

  expect(result.events).toContainEqual(
    expect.objectContaining({
      type: 'play',
      playerKey: 'player2',
      cardBaseId: 'bookOfAsh',
    }),
  )
  expect(result.events).toContainEqual(
    expect.objectContaining({
      type: 'target',
      playerKey: 'player2',
      cardBaseId: 'bookOfAsh',
      targetBaseId: 'zombie',
    }),
  )
  expect(chaosRoundFiveAttacks[0]).toEqual(
    expect.objectContaining({ attackerBaseId: 'burrick' }),
  )
})

test('does not strategically pass play while useful cards are available', () => {
  const result = simulateRandomAiDuel({
    decks: [
      Array.from({ length: 12 }, () => 'novice'),
      Array.from({ length: 12 }, () => 'bookOfAsh'),
    ],
    seed: 'play-pass',
    maxSteps: 120,
  })

  expect(
    result.events.some(
      (event) => event.type === 'pass-play' && event.note === undefined,
    ),
  ).toBe(false)
})

test('logs unplayable-card passes and act passes', () => {
  const result = simulateRandomAiDuel({
    decks: [
      Array.from({ length: 6 }, () => 'novice'),
      Array.from({ length: 6 }, () => 'bookOfAsh'),
    ],
    seed: 'unplayable-pass',
    maxSteps: 80,
  })

  expect(result.events).toContainEqual(
    expect.objectContaining({
      type: 'pass-play',
      playerKey: 'player2',
      note: 'no playable card',
    }),
  )
  expect(result.events).toContainEqual(
    expect.objectContaining({
      type: 'pass-act',
      playerKey: 'player1',
    }),
  )
})

test('formats a markdown summary for ChatGPT analysis', () => {
  const result = simulateRandomAiDuelBatch({
    decks: [characterDeck, chaosDeck],
    playerLabels: deckLabels,
    runs: 1,
    seed: 'markdown',
    maxSteps: 60,
  })

  expect(formatRandomAiDuelBatchMarkdown(result)).toContain(
    '# Random AI Duel Batch',
  )
  expect(formatRandomAiDuelBatchMarkdown(result)).toContain(
    'Players: Order Hammerites (player1) vs Chaos Undead + Burricks (player2)',
  )
  expect(formatRandomAiDuelBatchMarkdown(result)).toContain(
    'Winners: Order Hammerites (player1)',
  )
  expect(formatRandomAiDuelBatchMarkdown(result)).toContain('Win conditions:')
  expect(formatRandomAiDuelBatchMarkdown(result)).toContain(
    'Average final board life:',
  )
  expect(formatRandomAiDuelBatchMarkdown(result)).toContain('| Duel | Reason |')
  expect(result.aggregate.winners.player1 + result.aggregate.winners.player2 + result.aggregate.winners.tie).toBe(1)
  expect(Object.values(result.aggregate.winConditions).reduce((sum, count) => sum + count, 0)).toBe(1)
})
