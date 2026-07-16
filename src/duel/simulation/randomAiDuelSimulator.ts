import type { CardBaseId } from '../../cards'
import { createAppStore } from '../../redux'
import type { User, UserDeck } from '../../user'
import { selectCardEffectTarget } from '../cardEffects'
import {
  attackCharacter,
  completeActTurn,
  completePlayTurn,
  completeRefresh,
  drawForPlayers,
  drawInitialHands,
  initiateDuelFromUsers,
  passActTurn,
  passPlayTurn,
  playCard,
} from '../state'
import type { DuelPlayer, DuelState, Phase, PlayerId, Stack } from '../types'
import {
  canActPlayerPass,
  canActTurnComplete,
  getPreferredRandomAiAttackPairs,
  getPreferredRandomAiEffectTargetIds,
  getPreferredRandomAiPlayableCardIds,
  isAwaitingCardEffectTarget,
  selectRandomItem,
} from '../utils'
import type { RandomSeed } from './seededRandom'
import { withSeededRandom } from './seededRandom'

export type SimulationPlayerKey = 'player1' | 'player2'
export type SimulationPlayerLabels = Record<SimulationPlayerKey, string>
export type RandomAiDuelOutcomeReason = 'coin-zero' | 'decks-empty' | 'max-steps'
export type RandomAiDuelWinner = SimulationPlayerKey | 'tie'
export type RandomAiDuelCoinWinner = RandomAiDuelWinner
export type RandomAiDuelWinCondition =
  | 'coin-zero'
  | 'coins-left'
  | 'board-life'
  | 'tie'
export type RandomAiDuelEventType =
  | 'draw'
  | 'play'
  | 'pass-play'
  | 'target'
  | 'attack'
  | 'pass-act'
  | 'complete-act'
  | 'refresh'
  | 'end'

export type CardPlayCounts = Partial<Record<CardBaseId, number>>

export interface RandomAiDuelEvent {
  type: RandomAiDuelEventType
  step: number
  round: number
  phase: Phase
  playerKey?: SimulationPlayerKey
  playerId?: PlayerId
  cardBaseId?: CardBaseId
  targetBaseId?: CardBaseId
  targetStack?: Stack
  attackerBaseId?: CardBaseId
  defenderBaseId?: CardBaseId
  reason?: RandomAiDuelOutcomeReason
  note?: string
}

export interface SimulatedPlayerFinalState {
  playerKey: SimulationPlayerKey
  playerId: PlayerId
  name: string
  coins: number
  income: number
  deckCount: number
  handCount: number
  boardCount: number
  boardLife: number
  discardCount: number
  boardCards: CardBaseId[]
  handCards: CardBaseId[]
  discardCards: CardBaseId[]
}

export interface RandomAiDuelRecord {
  duelIndex: number
  seed: string
  decks: readonly [UserDeck, UserDeck]
  playerLabels: SimulationPlayerLabels
  events: RandomAiDuelEvent[]
  playedCards: Record<SimulationPlayerKey, CardPlayCounts>
  finalPlayers: Record<SimulationPlayerKey, SimulatedPlayerFinalState>
  finalRound: number
  steps: number
  outcomeReason: RandomAiDuelOutcomeReason
  winner: RandomAiDuelWinner
  winCondition: RandomAiDuelWinCondition
  coinWinner: RandomAiDuelCoinWinner
}

export interface RandomAiDuelBatchAggregate {
  outcomeReasons: Record<RandomAiDuelOutcomeReason, number>
  winners: Record<RandomAiDuelWinner, number>
  winConditions: Record<RandomAiDuelWinCondition, number>
  coinWinners: Record<RandomAiDuelCoinWinner, number>
  averageFinalCoins: Record<SimulationPlayerKey, number>
  averageFinalBoardLife: Record<SimulationPlayerKey, number>
  averageRounds: number
  averageSteps: number
  playedCards: Record<SimulationPlayerKey, CardPlayCounts>
}

export interface RandomAiDuelBatchResult {
  seed: string
  runs: number
  decks: readonly [UserDeck, UserDeck]
  playerLabels: SimulationPlayerLabels
  maxSteps: number
  duels: RandomAiDuelRecord[]
  aggregate: RandomAiDuelBatchAggregate
}

export interface SimulateRandomAiDuelOptions {
  decks: readonly [UserDeck, UserDeck]
  seed: RandomSeed
  playerLabels?: Partial<SimulationPlayerLabels>
  duelIndex?: number
  maxSteps?: number
}

export interface SimulateRandomAiDuelBatchOptions {
  decks: readonly [UserDeck, UserDeck]
  seed: RandomSeed
  playerLabels?: Partial<SimulationPlayerLabels>
  runs?: number
  maxSteps?: number
}

const simulationPlayerKeys = ['player1', 'player2'] as const
const defaultMaxSteps = 1000
export const DEFAULT_RANDOM_AI_DUEL_RUNS = 100
const defaultPlayerLabels = {
  player1: 'Player 1',
  player2: 'Player 2',
} satisfies SimulationPlayerLabels

const normalizePlayerLabels = (
  playerLabels: Partial<SimulationPlayerLabels> = {},
): SimulationPlayerLabels => ({
  ...defaultPlayerLabels,
  ...playerLabels,
})

const createSimulationUsers = (
  decks: readonly [UserDeck, UserDeck],
  playerLabels: SimulationPlayerLabels,
) =>
  [
    {
      id: 'simulation-player-1',
      name: playerLabels.player1,
      activeDeck: [...decks[0]],
    },
    {
      id: 'simulation-player-2',
      name: playerLabels.player2,
      activeDeck: [...decks[1]],
    },
  ] satisfies [User, User]

const getPlayerKeyById = (users: readonly [User, User]) =>
  ({
    [users[0].id]: 'player1',
    [users[1].id]: 'player2',
  }) as Record<PlayerId, SimulationPlayerKey>

const createEmptyPlayCounts = (): Record<SimulationPlayerKey, CardPlayCounts> =>
  ({
    player1: {},
    player2: {},
  })

const incrementCardCount = (
  counts: CardPlayCounts,
  cardBaseId: CardBaseId,
) => {
  counts[cardBaseId] = (counts[cardBaseId] ?? 0) + 1
}

const getPlayerCardBaseIds = (
  state: DuelState,
  player: DuelPlayer,
  stack: Stack,
): CardBaseId[] => player[stack].map((cardId) => state.cards[cardId].baseId)

export const getPlayerBoardLife = (state: DuelState, player: DuelPlayer): number =>
  player.board.reduce((totalLife, cardId) => {
    const card = state.cards[cardId]

    return card?.type === 'character' ? totalLife + card.life : totalLife
  }, 0)

const summarizePlayer = (
  state: DuelState,
  playerKey: SimulationPlayerKey,
  playerId: PlayerId,
): SimulatedPlayerFinalState => {
  const player = state.players[playerId]

  return {
    playerKey,
    playerId,
    name: player.name,
    coins: player.coins,
    income: player.income,
    deckCount: player.deck.length,
    handCount: player.hand.length,
    boardCount: player.board.length,
    boardLife: getPlayerBoardLife(state, player),
    discardCount: player.discard.length,
    boardCards: getPlayerCardBaseIds(state, player, 'board'),
    handCards: getPlayerCardBaseIds(state, player, 'hand'),
    discardCards: getPlayerCardBaseIds(state, player, 'discard'),
  }
}

export const getRandomAiDuelStopReason = (
  state: DuelState,
): RandomAiDuelOutcomeReason | null => {
  const players = state.playerOrder.map((playerId) => state.players[playerId])

  if (state.winnerId || players.some((player) => player.coins <= 0)) {
    return 'coin-zero'
  }
  if (players.every((player) => player.deck.length === 0)) return 'decks-empty'

  return null
}

const getCoinWinner = (
  finalPlayers: Record<SimulationPlayerKey, SimulatedPlayerFinalState>,
): RandomAiDuelCoinWinner => {
  if (finalPlayers.player1.coins > finalPlayers.player2.coins) return 'player1'
  if (finalPlayers.player2.coins > finalPlayers.player1.coins) return 'player2'

  return 'tie'
}

export interface RandomAiDuelWinnerResult {
  winner: RandomAiDuelWinner
  winCondition: RandomAiDuelWinCondition
}

export const getRandomAiDuelWinner = (
  finalPlayers: Record<SimulationPlayerKey, SimulatedPlayerFinalState>,
  outcomeReason: RandomAiDuelOutcomeReason,
): RandomAiDuelWinnerResult => {
  const { player1, player2 } = finalPlayers

  if (outcomeReason === 'coin-zero') {
    const player1Depleted = player1.coins <= 0
    const player2Depleted = player2.coins <= 0

    if (player1Depleted !== player2Depleted) {
      return {
        winner: player1Depleted ? 'player2' : 'player1',
        winCondition: 'coin-zero',
      }
    }

    if (player1Depleted && player2Depleted) {
      return { winner: 'tie', winCondition: 'tie' }
    }
  }

  if (player1.coins !== player2.coins) {
    return {
      winner: player1.coins > player2.coins ? 'player1' : 'player2',
      winCondition: 'coins-left',
    }
  }

  if (player1.boardLife !== player2.boardLife) {
    return {
      winner: player1.boardLife > player2.boardLife ? 'player1' : 'player2',
      winCondition: 'board-life',
    }
  }

  return { winner: 'tie', winCondition: 'tie' }
}

const mergePlayCounts = (
  target: Record<SimulationPlayerKey, CardPlayCounts>,
  source: Record<SimulationPlayerKey, CardPlayCounts>,
) => {
  simulationPlayerKeys.forEach((playerKey) => {
    Object.entries(source[playerKey]).forEach(([cardBaseId, amount]) => {
      if (!amount) return

      target[playerKey][cardBaseId as CardBaseId] =
        (target[playerKey][cardBaseId as CardBaseId] ?? 0) + amount
    })
  })
}

const createEventFactory = (
  events: RandomAiDuelEvent[],
  getDuelState: () => DuelState,
) => (event: Omit<RandomAiDuelEvent, 'phase' | 'round' | 'step'>) => {
  const state = getDuelState()

  events.push({
    step: events.length + 1,
    round: state.round,
    phase: state.phase,
    ...event,
  })
}

export const simulateRandomAiDuel = ({
  decks,
  seed,
  playerLabels: playerLabelOverrides,
  duelIndex = 0,
  maxSteps = defaultMaxSteps,
}: SimulateRandomAiDuelOptions): RandomAiDuelRecord =>
  withSeededRandom(`${String(seed)}:${duelIndex}`, () => {
    const playerLabels = normalizePlayerLabels(playerLabelOverrides)
    const users = createSimulationUsers(decks, playerLabels)
    const playerKeyById = getPlayerKeyById(users)
    const store = createAppStore()
    const events: RandomAiDuelEvent[] = []
    const playedCards = createEmptyPlayCounts()
    const addEvent = createEventFactory(
      events,
      () => store.getState().duel,
    )

    store.dispatch(initiateDuelFromUsers(users))

    let steps = 0
    let outcomeReason = getRandomAiDuelStopReason(store.getState().duel)

    while (!outcomeReason && steps < maxSteps) {
      const didStep = runSimulationStep({
        addEvent,
        playerKeyById,
        playedCards,
        store,
      })

      if (!didStep) break

      steps += 1
      outcomeReason = getRandomAiDuelStopReason(store.getState().duel)
    }

    const finalReason = outcomeReason ?? 'max-steps'
    const finalState = store.getState().duel
    const finalPlayers = {
      player1: summarizePlayer(finalState, 'player1', users[0].id),
      player2: summarizePlayer(finalState, 'player2', users[1].id),
    }
    const { winner, winCondition } = getRandomAiDuelWinner(
      finalPlayers,
      finalReason,
    )

    addEvent({ type: 'end', reason: finalReason })

    return {
      duelIndex,
      seed: `${String(seed)}:${duelIndex}`,
      decks,
      playerLabels,
      events,
      playedCards,
      finalPlayers,
      finalRound: finalState.round,
      steps,
      outcomeReason: finalReason,
      winner,
      winCondition,
      coinWinner: getCoinWinner(finalPlayers),
    }
  })

interface SimulationStepContext {
  addEvent: (event: Omit<RandomAiDuelEvent, 'phase' | 'round' | 'step'>) => void
  playerKeyById: Record<PlayerId, SimulationPlayerKey>
  playedCards: Record<SimulationPlayerKey, CardPlayCounts>
  store: ReturnType<typeof createAppStore>
}

const runSimulationStep = ({
  addEvent,
  playerKeyById,
  playedCards,
  store,
}: SimulationStepContext): boolean => {
  const state = store.getState().duel

  if (state.phase === 'setup') {
    addEvent({ type: 'draw', note: 'initial hands' })
    store.dispatch(drawInitialHands())
    return true
  }

  if (state.phase === 'draw') {
    addEvent({ type: 'draw', note: 'turn draw' })
    store.dispatch(drawForPlayers())
    return true
  }

  if (state.phase === 'refresh') {
    addEvent({ type: 'refresh' })
    store.dispatch(completeRefresh())
    return true
  }

  if (state.phase === 'play') {
    return runPlayStep({ addEvent, playerKeyById, playedCards, store })
  }

  return runActStep({ addEvent, playerKeyById, store })
}

const completePlayTurnIfReady = (store: ReturnType<typeof createAppStore>) => {
  const state = store.getState().duel
  const activePlayer = state.players[state.playerOrder[0]]

  if (
    state.phase === 'play' &&
    activePlayer?.hasActedThisPhase &&
    !isAwaitingCardEffectTarget(state)
  ) {
    store.dispatch(completePlayTurn())
  }
}

const runPlayStep = ({
  addEvent,
  playerKeyById,
  playedCards,
  store,
}: SimulationStepContext): boolean => {
  const state = store.getState().duel
  const activePlayerId = state.playerOrder[0]
  const activePlayer = state.players[activePlayerId]
  const playerKey = playerKeyById[activePlayerId]

  if (isAwaitingCardEffectTarget(state)) {
    const targetCardId = selectRandomItem(
      getPreferredRandomAiEffectTargetIds(state),
    )
    const pendingCard = state.pendingPlayedCardId
      ? state.cards[state.pendingPlayedCardId]
      : undefined
    const targetCard = targetCardId ? state.cards[targetCardId] : undefined

    if (!targetCardId || !pendingCard || !targetCard) return false

    addEvent({
      type: 'target',
      playerId: pendingCard.ownerId,
      playerKey: playerKeyById[pendingCard.ownerId],
      cardBaseId: pendingCard.baseId,
      targetBaseId: targetCard.baseId,
      targetStack: targetCard.stack,
    })
    store.dispatch(selectCardEffectTarget({ targetCardInstanceId: targetCardId }))
    completePlayTurnIfReady(store)
    return true
  }

  if (!activePlayer || activePlayer.hasActedThisPhase) {
    completePlayTurnIfReady(store)
    return true
  }

  const cardId = selectRandomItem(
    getPreferredRandomAiPlayableCardIds(state, activePlayerId),
  )
  const card = cardId ? state.cards[cardId] : undefined

  if (!cardId || !card) {
    addEvent({
      type: 'pass-play',
      playerId: activePlayerId,
      playerKey,
      note: 'no playable card',
    })
    store.dispatch(passPlayTurn())
    completePlayTurnIfReady(store)
    return true
  }

  addEvent({
    type: 'play',
    playerId: activePlayerId,
    playerKey,
    cardBaseId: card.baseId,
  })
  incrementCardCount(playedCards[playerKey], card.baseId)
  store.dispatch(
    playCard({
      playerId: activePlayerId,
      cardInstanceId: cardId,
      cardBaseId: card.baseId,
    }),
  )
  completePlayTurnIfReady(store)

  return true
}

const runActStep = ({
  addEvent,
  playerKeyById,
  store,
}: Omit<SimulationStepContext, 'playedCards'>): boolean => {
  const state = store.getState().duel
  const actPlayerId = state.actPlayerId

  if (!actPlayerId) return false

  const playerKey = playerKeyById[actPlayerId]
  const attackPair = selectRandomItem(
    getPreferredRandomAiAttackPairs(state, actPlayerId),
  )

  if (attackPair) {
    const attacker = state.cards[attackPair.attackerId]
    const defender = state.cards[attackPair.defenderId]

    addEvent({
      type: 'attack',
      playerId: actPlayerId,
      playerKey,
      attackerBaseId: attacker.baseId,
      defenderBaseId: defender.baseId,
    })
    store.dispatch(attackCharacter(attackPair))
  } else if (canActPlayerPass(state)) {
    addEvent({ type: 'pass-act', playerId: actPlayerId, playerKey })
    store.dispatch(passActTurn())
  } else if (canActTurnComplete(state)) {
    addEvent({ type: 'complete-act', playerId: actPlayerId, playerKey })
  } else {
    return false
  }

  if (canActTurnComplete(store.getState().duel)) {
    store.dispatch(completeActTurn())
  }

  return true
}

export const simulateRandomAiDuelBatch = ({
  decks,
  seed,
  playerLabels: playerLabelOverrides,
  runs = DEFAULT_RANDOM_AI_DUEL_RUNS,
  maxSteps = defaultMaxSteps,
}: SimulateRandomAiDuelBatchOptions): RandomAiDuelBatchResult => {
  const playerLabels = normalizePlayerLabels(playerLabelOverrides)
  const duels = Array.from({ length: runs }, (_, duelIndex) =>
    simulateRandomAiDuel({ decks, seed, playerLabels, duelIndex, maxSteps }),
  )

  return {
    seed: String(seed),
    runs,
    decks,
    playerLabels,
    maxSteps,
    duels,
    aggregate: aggregateRandomAiDuels(duels),
  }
}

const aggregateRandomAiDuels = (
  duels: readonly RandomAiDuelRecord[],
): RandomAiDuelBatchAggregate => {
  const playedCards = createEmptyPlayCounts()
  const outcomeReasons = {
    'coin-zero': 0,
    'decks-empty': 0,
    'max-steps': 0,
  }
  const coinWinners = {
    player1: 0,
    player2: 0,
    tie: 0,
  }
  const winners = {
    player1: 0,
    player2: 0,
    tie: 0,
  }
  const winConditions = {
    'coin-zero': 0,
    'coins-left': 0,
    'board-life': 0,
    tie: 0,
  }

  duels.forEach((duel) => {
    outcomeReasons[duel.outcomeReason] += 1
    winners[duel.winner] += 1
    winConditions[duel.winCondition] += 1
    coinWinners[duel.coinWinner] += 1
    mergePlayCounts(playedCards, duel.playedCards)
  })

  const divisor = duels.length || 1

  return {
    outcomeReasons,
    winners,
    winConditions,
    coinWinners,
    averageFinalCoins: {
      player1:
        duels.reduce((sum, duel) => sum + duel.finalPlayers.player1.coins, 0) /
        divisor,
      player2:
        duels.reduce((sum, duel) => sum + duel.finalPlayers.player2.coins, 0) /
        divisor,
    },
    averageFinalBoardLife: {
      player1:
        duels.reduce(
          (sum, duel) => sum + duel.finalPlayers.player1.boardLife,
          0,
        ) / divisor,
      player2:
        duels.reduce(
          (sum, duel) => sum + duel.finalPlayers.player2.boardLife,
          0,
        ) / divisor,
    },
    averageRounds:
      duels.reduce((sum, duel) => sum + duel.finalRound, 0) / divisor,
    averageSteps: duels.reduce((sum, duel) => sum + duel.steps, 0) / divisor,
    playedCards,
  }
}

const formatCardCounts = (counts: CardPlayCounts): string => {
  const entries = Object.entries(counts).filter(([, amount]) => Boolean(amount))

  if (entries.length === 0) return 'none'

  return entries
    .sort(([firstBaseId], [secondBaseId]) =>
      firstBaseId.localeCompare(secondBaseId),
    )
    .map(([cardBaseId, amount]) => `${cardBaseId}: ${amount}`)
    .join(', ')
}

const formatNumber = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(2)

const formatPlayerLabel = (
  playerLabels: SimulationPlayerLabels,
  playerKey: SimulationPlayerKey,
): string => `${playerLabels[playerKey]} (${playerKey})`

const formatCoinWinner = (
  playerLabels: SimulationPlayerLabels,
  coinWinner: RandomAiDuelCoinWinner,
): string =>
  coinWinner === 'tie' ? coinWinner : formatPlayerLabel(playerLabels, coinWinner)

const formatWinner = (
  playerLabels: SimulationPlayerLabels,
  winner: RandomAiDuelWinner,
): string =>
  winner === 'tie' ? winner : formatPlayerLabel(playerLabels, winner)

export const formatRandomAiDuelBatchMarkdown = (
  result: RandomAiDuelBatchResult,
): string => {
  const player1Label = formatPlayerLabel(result.playerLabels, 'player1')
  const player2Label = formatPlayerLabel(result.playerLabels, 'player2')
  const lines = [
    '# Random AI Duel Batch',
    '',
    `Seed: \`${result.seed}\``,
    `Runs: ${result.runs}`,
    `Max steps per duel: ${result.maxSteps}`,
    `Players: ${player1Label} vs ${player2Label}`,
    '',
    '## Aggregate',
    '',
    `Outcome reasons: coin-zero ${result.aggregate.outcomeReasons['coin-zero']}, decks-empty ${result.aggregate.outcomeReasons['decks-empty']}, max-steps ${result.aggregate.outcomeReasons['max-steps']}`,
    `Winners: ${player1Label} ${result.aggregate.winners.player1}, ${player2Label} ${result.aggregate.winners.player2}, tie ${result.aggregate.winners.tie}`,
    `Win conditions: coin-zero ${result.aggregate.winConditions['coin-zero']}, coins-left ${result.aggregate.winConditions['coins-left']}, board-life ${result.aggregate.winConditions['board-life']}, tie ${result.aggregate.winConditions.tie}`,
    `Coin winners (diagnostic): ${player1Label} ${result.aggregate.coinWinners.player1}, ${player2Label} ${result.aggregate.coinWinners.player2}, tie ${result.aggregate.coinWinners.tie}`,
    `Average final coins: ${player1Label} ${formatNumber(result.aggregate.averageFinalCoins.player1)}, ${player2Label} ${formatNumber(result.aggregate.averageFinalCoins.player2)}`,
    `Average final board life: ${player1Label} ${formatNumber(result.aggregate.averageFinalBoardLife.player1)}, ${player2Label} ${formatNumber(result.aggregate.averageFinalBoardLife.player2)}`,
    `Average rounds: ${formatNumber(result.aggregate.averageRounds)}`,
    `Average steps: ${formatNumber(result.aggregate.averageSteps)}`,
    '',
    '## Played Cards',
    '',
    `${player1Label}: ${formatCardCounts(result.aggregate.playedCards.player1)}`,
    `${player2Label}: ${formatCardCounts(result.aggregate.playedCards.player2)}`,
    '',
    '## Duel Outcomes',
    '',
    `| Duel | Reason | Winner | Win condition | ${player1Label} coins | ${player1Label} board life | ${player2Label} coins | ${player2Label} board life | Coin winner | Rounds | Steps | ${player1Label} played | ${player2Label} played |`,
    '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | --- | --- |',
  ]

  result.duels.forEach((duel) => {
    lines.push(
      `| ${duel.duelIndex + 1} | ${duel.outcomeReason} | ${formatWinner(result.playerLabels, duel.winner)} | ${duel.winCondition} | ${duel.finalPlayers.player1.coins} | ${duel.finalPlayers.player1.boardLife} | ${duel.finalPlayers.player2.coins} | ${duel.finalPlayers.player2.boardLife} | ${formatCoinWinner(result.playerLabels, duel.coinWinner)} | ${duel.finalRound} | ${duel.steps} | ${formatCardCounts(duel.playedCards.player1)} | ${formatCardCounts(duel.playedCards.player2)} |`,
    )
  })

  return `${lines.join('\n')}\n`
}
