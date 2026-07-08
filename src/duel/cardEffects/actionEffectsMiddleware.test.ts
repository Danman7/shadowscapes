import { configureStore, createAction } from '@reduxjs/toolkit'

import { setupMockedDuel } from '../../user'
import { duelReducer, passActTurn, summonAllCopies, summonCard } from '../state'
import {
  createActPassCardEffect,
  getPassedActCharacterIds,
} from './actPassEffect'
import {
  createActionEffectsMiddleware,
  type ActionEffectRegistration,
} from './actionEffectsMiddleware'
import {
  createOnPlayCardEffect,
  getNewBoardCardIds,
  type CardEffectsState,
} from './onPlayEffect'

test('returns the downstream result without matching a non-action value', () => {
  const registration = {
    matches: vi.fn(() => true),
    run: vi.fn(),
  }
  const state = { value: 1 }
  const next = vi.fn(() => 'downstream result')
  const invoke = createActionEffectsMiddleware([registration])({
    dispatch: vi.fn(),
    getState: () => state,
  })(next)

  expect(invoke(null)).toBe('downstream result')
  expect(next).toHaveBeenCalledWith(null)
  expect(registration.matches).not.toHaveBeenCalled()
  expect(registration.run).not.toHaveBeenCalled()
})

test('forwards actions, runs after the reducer, and allows nested dispatch', () => {
  const increment = createAction<number>('test/increment')
  const addBonus = createAction<number>('test/addBonus')
  const observations: Array<[number, number]> = []
  const registration: ActionEffectRegistration<number> = {
    matches: increment.match,
    run: ({ action, dispatch, getState, previousState }) => {
      observations.push([previousState, getState()])
      dispatch(addBonus((action.payload as number) * 10))
    },
  }
  const store = configureStore({
    reducer: (state = 0, action) => {
      if (increment.match(action) || addBonus.match(action)) {
        return state + action.payload
      }

      return state
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        createActionEffectsMiddleware([registration]),
      ),
  })
  const action = increment(2)

  expect(store.dispatch(action)).toEqual(action)
  expect(observations).toEqual([[0, 2]])
  expect(store.getState()).toBe(22)
})

test('ignores unrelated and rejected board-entry actions', () => {
  const onPlay = vi.fn()
  const state = setupMockedDuel({ activePlayer: { hand: 'novice' } })
  const playerId = state.playerOrder[0]
  const cardInstanceId = state.players[playerId].hand[0]
  const store = createEffectsTestStore(
    state,
    createOnPlayCardEffect('novice', onPlay),
  )

  store.dispatch({ type: 'unrelated' })
  store.dispatch(
    summonCard({ playerId, cardInstanceId, from: 'discard' }),
  )

  expect(onPlay).not.toHaveBeenCalled()
})

test('on-play helpers reject unrelated actions and missing players', () => {
  const duel = setupMockedDuel()
  const state = { duel }
  const unrelatedContext = {
    action: { type: 'unrelated' },
    previousState: state,
    state,
    dispatch: vi.fn(),
    getState: () => state,
  }
  const onPlay = vi.fn()

  expect(getNewBoardCardIds(unrelatedContext)).toEqual([])
  createOnPlayCardEffect('novice', onPlay).run(unrelatedContext)
  expect(onPlay).not.toHaveBeenCalled()

  const missingPlayerAction = summonAllCopies({
    playerId: 'missing',
    cardBaseId: 'novice',
    from: 'hand',
  })

  expect(
    getNewBoardCardIds({
      ...unrelatedContext,
      action: missingPlayerAction,
    }),
  ).toEqual([])
})

test('treats a newly added player as having an empty previous board', () => {
  const duel = setupMockedDuel({ activePlayer: { board: 'novice' } })
  const playerId = duel.playerOrder[0]
  const previousDuel = structuredClone(duel)
  const expectedCardIds = duel.players[playerId].board

  delete previousDuel.players[playerId]

  expect(
    getNewBoardCardIds({
      action: summonAllCopies({
        playerId,
        cardBaseId: 'novice',
        from: 'hand',
      }),
      previousState: { duel: previousDuel },
      state: { duel },
      dispatch: vi.fn(),
      getState: () => ({ duel }),
    }),
  ).toEqual(expectedCardIds)
})

test('act-pass helpers reject unrelated and unpassable actions', () => {
  const duel = setupMockedDuel({ activePlayer: { board: 'burrick' } })
  const context = {
    action: { type: 'unrelated' },
    previousState: { duel },
    state: { duel },
    dispatch: vi.fn(),
    getState: () => ({ duel }),
  }

  expect(getPassedActCharacterIds(context)).toEqual([])

  const unpassableDuel = setupMockedDuel({
    activePlayer: { board: 'burrick' },
    phase: 'play',
  })

  expect(
    getPassedActCharacterIds({
      ...context,
      action: passActTurn(),
      previousState: { duel: unpassableDuel },
      state: { duel: unpassableDuel },
      getState: () => ({ duel: unpassableDuel }),
    }),
  ).toEqual([])
})

test('act-pass helpers require the reducer to mark the actor as passed', () => {
  const previousDuel = setupMockedDuel({
    activePlayer: { board: 'burrick' },
    phase: 'act',
  })
  const stateDuel = structuredClone(previousDuel)

  expect(
    getPassedActCharacterIds({
      action: passActTurn(),
      previousState: { duel: previousDuel },
      state: { duel: stateDuel },
      dispatch: vi.fn(),
      getState: () => ({ duel: stateDuel }),
    }),
  ).toEqual([])
})

test('act-pass helpers reject when the post-pass actor is missing', () => {
  const previousDuel = setupMockedDuel({
    activePlayer: { board: 'burrick' },
    phase: 'act',
  })
  const playerId = previousDuel.playerOrder[0]
  const stateDuel = structuredClone(previousDuel)

  delete stateDuel.players[playerId]

  expect(
    getPassedActCharacterIds({
      action: passActTurn(),
      previousState: { duel: previousDuel },
      state: { duel: stateDuel },
      dispatch: vi.fn(),
      getState: () => ({ duel: stateDuel }),
    }),
  ).toEqual([])
})

test('act-pass card effects ignore contexts without a previous actor', () => {
  const duel = setupMockedDuel({ activePlayer: { board: 'burrick' } })
  const effect = vi.fn()

  createActPassCardEffect('burrick', effect).run({
    action: passActTurn(),
    previousState: { duel },
    state: { duel },
    dispatch: vi.fn(),
    getState: () => ({ duel }),
  })

  expect(effect).not.toHaveBeenCalled()
})

test('runs one on-play effect for every successfully bulk-summoned card', () => {
  const onPlay = vi.fn()
  const state = setupMockedDuel({
    activePlayer: { hand: ['novice', 'acolyte', 'novice'] },
  })
  const playerId = state.playerOrder[0]
  const noviceIds = state.players[playerId].hand.filter(
    (cardId) => state.cards[cardId].baseId === 'novice',
  )
  const store = createEffectsTestStore(
    state,
    createOnPlayCardEffect('novice', onPlay),
  )

  store.dispatch(
    summonAllCopies({ playerId, cardBaseId: 'novice', from: 'hand' }),
  )

  expect(onPlay).toHaveBeenCalledTimes(2)
  expect(onPlay.mock.calls.map(([context]) => context.cardInstanceId)).toEqual(
    noviceIds,
  )
})

test('nested summons trigger their own effect exactly once', () => {
  const state = setupMockedDuel({
    activePlayer: { hand: ['novice', 'acolyte'] },
  })
  const playerId = state.playerOrder[0]
  const [noviceId, acolyteId] = state.players[playerId].hand
  const acolyteOnPlay = vi.fn()
  const noviceOnPlay = createOnPlayCardEffect(
    'novice',
    ({ dispatch }) => {
      dispatch(
        summonCard({
          playerId,
          cardInstanceId: acolyteId,
          from: 'hand',
        }),
      )
    },
  )
  const store = configureStore({
    reducer: { duel: duelReducer },
    preloadedState: { duel: state },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        createActionEffectsMiddleware<CardEffectsState>([
          noviceOnPlay,
          createOnPlayCardEffect('acolyte', acolyteOnPlay),
        ]),
      ),
  })

  store.dispatch(
    summonCard({ playerId, cardInstanceId: noviceId, from: 'hand' }),
  )

  expect(acolyteOnPlay).toHaveBeenCalledOnce()
  expect(store.getState().duel.players[playerId].board).toEqual([
    noviceId,
    acolyteId,
  ])
})

const createEffectsTestStore = (
  duel: ReturnType<typeof setupMockedDuel>,
  registration: ActionEffectRegistration<CardEffectsState>,
) =>
  configureStore({
    reducer: { duel: duelReducer },
    preloadedState: { duel },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        createActionEffectsMiddleware<CardEffectsState>([registration]),
      ),
  })
