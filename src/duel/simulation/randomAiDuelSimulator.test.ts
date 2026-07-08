import { setupMockedDuel } from '../../user'
import type { UserDeck } from '../../user'
import {
  formatRandomAiDuelBatchMarkdown,
  getRandomAiDuelStopReason,
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

test('logs play passes when a player has a large board lead', () => {
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
      (event) =>
        event.type === 'pass-play' &&
        event.playerKey === 'player1' &&
        event.note === undefined,
    ),
  ).toBe(true)
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
    'Coin winners: Order Hammerites (player1)',
  )
  expect(formatRandomAiDuelBatchMarkdown(result)).toContain('| Duel | Reason |')
})
