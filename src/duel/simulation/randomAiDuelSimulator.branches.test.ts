import { completePlayTurn } from '../state'
import type { DuelPlayer, DuelState, PlayerId } from '../types'

const playerIds = ['simulation-player-1', 'simulation-player-2'] as const

const createPlayer = (
  id: PlayerId,
  hasActedThisPhase = false,
): DuelPlayer => ({
  id,
  name: id,
  coins: 30,
  income: 0,
  deck: [`${id}-deck-card`],
  hand: [],
  board: [],
  discard: [],
  hasActedThisPhase,
})

const createDuelState = (
  overrides: Partial<DuelState>,
): DuelState => ({
  round: 0,
  phase: 'play',
  mode: { type: 'hot-seat' },
  winnerId: null,
  playerOrder: [...playerIds],
  players: {
    [playerIds[0]]: createPlayer(playerIds[0]),
    [playerIds[1]]: createPlayer(playerIds[1]),
  },
  cards: {},
  pendingPlayedCardId: null,
  actPlayerId: null,
  ...overrides,
})

const importSimulatorWithDuelState = async (duelState: DuelState) => {
  const dispatch = vi.fn()

  vi.resetModules()
  vi.doMock('../../redux', () => ({
    createAppStore: () => ({
      dispatch,
      getState: () => ({ duel: duelState }),
    }),
  }))

  const simulator = await import('./randomAiDuelSimulator')

  return { dispatch, simulator }
}

afterEach(() => {
  vi.doUnmock('../../redux')
  vi.resetModules()
})

test('completes play when the active player already acted', async () => {
  const duelState = createDuelState({
    players: {
      [playerIds[0]]: createPlayer(playerIds[0], true),
      [playerIds[1]]: createPlayer(playerIds[1]),
    },
  })
  const { dispatch, simulator } = await importSimulatorWithDuelState(duelState)

  const result = simulator.simulateRandomAiDuel({
    decks: [[], []],
    seed: 'already-acted-play',
    maxSteps: 1,
  })

  expect(result.steps).toBe(1)
  expect(dispatch).toHaveBeenCalledWith(completePlayTurn())
})

test('stops when the act player is missing from state', async () => {
  const duelState = createDuelState({
    phase: 'act',
    actPlayerId: 'missing-player',
  })
  const { simulator } = await importSimulatorWithDuelState(duelState)

  const result = simulator.simulateRandomAiDuel({
    decks: [[], []],
    seed: 'missing-act-player',
    maxSteps: 1,
  })

  expect(result.steps).toBe(0)
  expect(result.outcomeReason).toBe('max-steps')
})
