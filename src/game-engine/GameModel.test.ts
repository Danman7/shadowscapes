import { GameModel } from 'src/game-engine/GameModel'
import { createCardInstance, createDuel } from 'src/game-engine/helpers'
import { initialDuelState } from 'src/game-engine/helpers'
import type { GameEvent } from 'src/game-engine/events'
import { DEFAULT_DUEL_SETUP } from 'src/test/mocks/duelSetup'

const createTestModel = () => {
  const state = createDuel(DEFAULT_DUEL_SETUP, {
    phase: 'player-turn',
    playerOrder: ['player1', 'player2'],
    stackOverrides: {
      player1: {
        hand: ['zombie', 'haunt'],
        board: ['cook'],
        deck: ['templeGuard'],
        discard: [],
      },
      player2: {
        hand: ['novice'],
        board: ['templeGuard'],
        deck: ['zombie'],
        discard: [],
      },
    },
  })

  return new GameModel(state)
}

describe('getState', () => {
  test('returns initial state', () => {
    const model = new GameModel(initialDuelState)
    const { phase, logs, cards, players } = model.getState()

    expect(phase).toBe(initialDuelState.phase)
    expect(logs).toEqual(initialDuelState.logs)
    expect(cards).toEqual(initialDuelState.cards)
    expect(players).toEqual(initialDuelState.players)
  })
})

describe('dispatch', () => {
  test('updates state via reducer', () => {
    const model = createTestModel()
    const handBefore = model.getState().players.player1.hand.length

    model.dispatch({
      type: 'PLAY_CARD',
      payload: {
        playerId: 'player1',
        cardInstanceId: model.getState().players.player1.hand[0]!,
      },
    })

    expect(model.getState().players.player1.hand.length).toBe(handBefore - 1)
    expect(model.getState().phase).toBe('turn-end')
  })
})

describe('subscribe', () => {
  test('fires listener on state change', () => {
    const model = createTestModel()
    const listener = vi.fn()

    model.subscribe(listener)

    model.dispatch({
      type: 'PLAY_CARD',
      payload: {
        playerId: 'player1',
        cardInstanceId: model.getState().players.player1.hand[0]!,
      },
    })

    expect(listener).toHaveBeenCalledOnce()
  })

  test('unsubscribe stops notifications', () => {
    const model = createTestModel()
    const listener = vi.fn()

    const unsubscribe = model.subscribe(listener)
    unsubscribe()

    model.dispatch({
      type: 'PLAY_CARD',
      payload: {
        playerId: 'player1',
        cardInstanceId: model.getState().players.player1.hand[0]!,
      },
    })

    expect(listener).not.toHaveBeenCalled()
  })

  test('multiple subscribers all receive notifications', () => {
    const model = createTestModel()
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    model.subscribe(listener1)
    model.subscribe(listener2)

    model.dispatch({
      type: 'PLAY_CARD',
      payload: {
        playerId: 'player1',
        cardInstanceId: model.getState().players.player1.hand[0]!,
      },
    })

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledOnce()
  })
})

describe('subscribeToEvents', () => {
  test('receives ACTION_DISPATCHED for every dispatch', () => {
    const model = createTestModel()
    const events: GameEvent[][] = []

    model.subscribeToEvents((e) => events.push(e))

    model.dispatch({ type: 'SWITCH_TURN' })

    expect(events).toHaveLength(1)
    expect(events[0]!.some((e) => e.type === 'ACTION_DISPATCHED')).toBe(true)
  })

  test('receives PHASE_CHANGED when phase transitions', () => {
    const model = createTestModel()
    const allEvents: GameEvent[] = []

    model.subscribeToEvents((events) => allEvents.push(...events))

    const cardId = model.getState().players.player1.hand[0]!

    model.dispatch({
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: cardId },
    })

    const phaseEvent = allEvents.find((e) => e.type === 'PHASE_CHANGED')
    expect(phaseEvent).toBeDefined()
    expect(phaseEvent!.type === 'PHASE_CHANGED' && phaseEvent!.from).toBe(
      'player-turn',
    )
    expect(phaseEvent!.type === 'PHASE_CHANGED' && phaseEvent!.to).toBe(
      'turn-end',
    )
  })

  test('receives TURN_SWITCHED when turn changes', () => {
    const model = createTestModel()
    const allEvents: GameEvent[] = []

    model.subscribeToEvents((events) => allEvents.push(...events))

    model.dispatch({ type: 'SWITCH_TURN' })

    const turnEvent = allEvents.find((e) => e.type === 'TURN_SWITCHED')
    expect(turnEvent).toBeDefined()
    expect(
      turnEvent!.type === 'TURN_SWITCHED' && turnEvent!.activePlayerId,
    ).toBe('player2')
  })

  test('receives CARD_ZONE_CHANGED when card moves from hand to board', () => {
    const model = createTestModel()
    const allEvents: GameEvent[] = []

    model.subscribeToEvents((events) => allEvents.push(...events))

    const cardId = model.getState().players.player1.hand[0]!

    model.dispatch({
      type: 'PLAY_CARD',
      payload: { playerId: 'player1', cardInstanceId: cardId },
    })

    const zoneEvent = allEvents.find(
      (e) => e.type === 'CARD_ZONE_CHANGED' && e.cardId === cardId,
    )
    expect(zoneEvent).toBeDefined()
    if (zoneEvent?.type === 'CARD_ZONE_CHANGED') {
      expect(zoneEvent.from).toBe('hand')
      expect(zoneEvent.to).toBe('board')
      expect(zoneEvent.playerId).toBe('player1')
    }
  })

  test('receives CARD_STATS_CHANGED when card takes damage', () => {
    const model = createTestModel()
    const allEvents: GameEvent[] = []

    model.subscribeToEvents((events) => allEvents.push(...events))

    const attackerId = model.getState().players.player1.board[0]!
    const defenderId = model.getState().players.player2.board[0]!

    model.dispatch({
      type: 'ATTACK_CARD',
      payload: { attackerId, defenderId },
    })

    const statsEvent = allEvents.find(
      (e) => e.type === 'CARD_STATS_CHANGED' && e.cardId === defenderId,
    )
    expect(statsEvent).toBeDefined()
    if (statsEvent?.type === 'CARD_STATS_CHANGED') {
      expect(statsEvent.changes.life).toBeDefined()
    }
  })

  test('receives PLAYER_COINS_CHANGED when coins change', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      playerOrder: ['player1', 'player2'],
      cards: {
        1: { ...createCardInstance('zombie', 1), stunned: false },
      },
      players: {
        player1: {
          board: [1],
        },
        player2: {
          board: [],
          coins: 5,
        },
      },
    })
    const model = new GameModel(state)
    const allEvents: GameEvent[] = []

    model.subscribeToEvents((events) => allEvents.push(...events))

    model.dispatch({
      type: 'ATTACK_PLAYER',
      payload: { attackerId: 1 },
    })

    const coinsEvent = allEvents.find((e) => e.type === 'PLAYER_COINS_CHANGED')
    expect(coinsEvent).toBeDefined()
    if (coinsEvent?.type === 'PLAYER_COINS_CHANGED') {
      expect(coinsEvent.playerId).toBe('player2')
      expect(coinsEvent.from).toBe(5)
      expect(coinsEvent.to).toBe(4)
    }
  })

  test('receives CARD_DESTROYED when a card is killed', () => {
    const state = createDuel(DEFAULT_DUEL_SETUP, {
      phase: 'player-turn',
      playerOrder: ['player1', 'player2'],
      cards: {
        1: createCardInstance('templeGuard', 1),
        2: createCardInstance('zombie', 2),
      },
      players: {
        player1: { board: [1] },
        player2: { board: [2], discard: [] },
      },
    })
    const model = new GameModel(state)
    const allEvents: GameEvent[] = []

    model.subscribeToEvents((events) => allEvents.push(...events))

    model.dispatch({
      type: 'ATTACK_CARD',
      payload: { attackerId: 1, defenderId: 2 },
    })

    const destroyEvent = allEvents.find(
      (e) => e.type === 'CARD_DESTROYED' && e.cardId === 2,
    )
    expect(destroyEvent).toBeDefined()
  })

  test('unsubscribe stops event notifications', () => {
    const model = createTestModel()
    const listener = vi.fn()

    const unsubscribe = model.subscribeToEvents(listener)
    unsubscribe()

    model.dispatch({ type: 'SWITCH_TURN' })

    expect(listener).not.toHaveBeenCalled()
  })
})
