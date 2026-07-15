import { createAppStore } from '../../redux'
import { setupMockedDuel } from '../../user'
import {
  duelReducer,
  playCard,
  resolvePendingPlayedCard,
  summonCard,
} from '../state'
import { orderEffects } from './orderEffects'
import { selectCardEffectTarget } from './targetedCardEffect'

test('Novice summons every remaining hand copy when a higher-life ally exists', () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 3,
      hand: ['novice', 'novice', 'novice'],
      board: 'acolyte',
    },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const playedCardId = initialState.players[playerId].hand[0]
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: playedCardId,
      cardBaseId: 'novice',
    }),
  )

  const state = store.getState().duel
  const noviceIds = state.players[playerId].board.filter(
    (cardId) => state.cards[cardId].baseId === 'novice',
  )

  expect(noviceIds).toHaveLength(3)
  expect(state.players[playerId].hand).toEqual([])
  expect(state.players[playerId].coins).toBe(2)
  noviceIds.forEach((cardId) => {
    expect(state.cards[cardId]).toMatchObject({ turnsStunned: 1 })
  })
})

test('Novice leaves other hand copies alone without a higher-life ally', () => {
  const initialState = setupMockedDuel({
    activePlayer: { hand: ['novice', 'novice'] },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const playedCardId = initialState.players[playerId].hand[0]
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: playedCardId,
      cardBaseId: 'novice',
    }),
  )

  expect(store.getState().duel.players[playerId]).toMatchObject({
    hand: [initialState.players[playerId].hand[1]],
    board: [playedCardId],
  })
})

test('Temple Guard gains life only when the opponent has more post-entry cards', () => {
  const outnumberedState = setupMockedDuel({
    activePlayer: { coins: 4, hand: 'templeGuard' },
    inactivePlayer: { board: ['zombie', 'haunt'] },
    phase: 'play',
  })
  const outnumberedPlayerId = outnumberedState.playerOrder[0]
  const outnumberedGuardId =
    outnumberedState.players[outnumberedPlayerId].hand[0]
  const outnumberedStore = createAppStore(outnumberedState)

  outnumberedStore.dispatch(
    playCard({
      playerId: outnumberedPlayerId,
      cardInstanceId: outnumberedGuardId,
      cardBaseId: 'templeGuard',
    }),
  )

  expect(outnumberedStore.getState().duel.cards[outnumberedGuardId]).toMatchObject(
    { life: 4 },
  )

  const tiedState = setupMockedDuel({
    activePlayer: { coins: 4, hand: 'templeGuard' },
    inactivePlayer: { board: 'zombie' },
    phase: 'play',
  })
  const tiedPlayerId = tiedState.playerOrder[0]
  const tiedGuardId = tiedState.players[tiedPlayerId].hand[0]
  const tiedStore = createAppStore(tiedState)

  tiedStore.dispatch(
    playCard({
      playerId: tiedPlayerId,
      cardInstanceId: tiedGuardId,
      cardBaseId: 'templeGuard',
    }),
  )

  expect(tiedStore.getState().duel.cards[tiedGuardId]).toMatchObject({ life: 3 })
})

test('a summoned Temple Guard also resolves its on-play effect', () => {
  const initialState = setupMockedDuel({
    activePlayer: { hand: 'templeGuard' },
    inactivePlayer: { board: ['zombie', 'haunt'] },
  })
  const playerId = initialState.playerOrder[0]
  const guardId = initialState.players[playerId].hand[0]
  const store = createAppStore(initialState)

  store.dispatch(
    summonCard({ playerId, cardInstanceId: guardId, from: 'hand' }),
  )

  expect(store.getState().duel.cards[guardId]).toMatchObject({
    life: 4,
    stack: 'board',
    turnsStunned: 1,
  })
})

test('Elevated Acolyte draws on play when it is alone on board', () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 3,
      deck: 'novice',
      hand: 'acolyte',
    },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const acolyteId = initialState.players[playerId].hand[0]
  const drawnCardId = initialState.players[playerId].deck[0]
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: acolyteId,
      cardBaseId: 'acolyte',
    }),
  )

  expect(store.getState().duel.players[playerId]).toMatchObject({
    income: 0,
    deck: [],
    hand: [drawnCardId],
    board: [acolyteId],
  })
})

test('Elevated Acolyte gains income instead when it has an ally', () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 3,
      deck: 'novice',
      hand: 'acolyte',
      board: 'templeGuard',
    },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const acolyteId = initialState.players[playerId].hand[0]
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: acolyteId,
      cardBaseId: 'acolyte',
    }),
  )

  expect(store.getState().duel.players[playerId]).toMatchObject({
    income: 1,
    deck: initialState.players[playerId].deck,
    hand: [],
  })
})

test('Elevated Acolyte effect ignores missing players and non-board entries', () => {
  const initialState = setupMockedDuel({
    activePlayer: { hand: 'acolyte' },
  })
  const playerId = initialState.playerOrder[0]
  const acolyteId = initialState.players[playerId].hand[0]
  const action = summonCard({
    playerId,
    cardInstanceId: acolyteId,
    from: 'hand',
  })
  const enteredState = duelReducer(initialState, action)
  const missingPlayerState = structuredClone(enteredState)
  const nonBoardEntryState = structuredClone(enteredState)

  delete missingPlayerState.players[playerId]
  nonBoardEntryState.players[playerId].board = []

  const missingPlayerDispatch = vi.fn()
  orderEffects[2].run({
    action,
    previousState: { duel: initialState },
    state: { duel: enteredState },
    dispatch: missingPlayerDispatch,
    getState: () => ({ duel: missingPlayerState }),
  })
  const nonBoardEntryDispatch = vi.fn()
  orderEffects[2].run({
    action,
    previousState: { duel: initialState },
    state: { duel: enteredState },
    dispatch: nonBoardEntryDispatch,
    getState: () => ({ duel: nonBoardEntryState }),
  })

  expect(missingPlayerDispatch).not.toHaveBeenCalled()
  expect(nonBoardEntryDispatch).not.toHaveBeenCalled()
})

test("Saint Yora's Skull stays pending, then buffs its target and adjacent allies", () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 4,
      hand: 'yoraSkull',
      board: ['novice', 'acolyte', 'templeGuard'],
    },
    inactivePlayer: { board: ['zombie', 'haunt', 'zombie', 'haunt'] },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const player = initialState.players[playerId]
  const skullId = player.hand[0]
  const [noviceId, acolyteId, guardId] = player.board
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: skullId,
      cardBaseId: 'yoraSkull',
    }),
  )

  expect(store.getState().duel).toMatchObject({ pendingPlayedCardId: skullId })
  expect(store.getState().duel.players[playerId].board).toEqual([
    noviceId,
    acolyteId,
    guardId,
    skullId,
  ])

  store.dispatch(selectCardEffectTarget({ targetCardInstanceId: acolyteId }))

  const state = store.getState().duel

  expect(state.cards[noviceId]).toMatchObject({ life: 2 })
  expect(state.cards[acolyteId]).toMatchObject({ life: 4 })
  expect(state.cards[guardId]).toMatchObject({ life: 4 })
  expect(state.cards[skullId]).toMatchObject({ stack: 'discard' })
  expect(state.players[playerId]).toMatchObject({
    board: [noviceId, acolyteId, guardId],
    discard: [skullId],
  })
  expect(state.pendingPlayedCardId).toBeNull()
})

test("Saint Yora's Skull rejects an opponent's character as its target", () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 4,
      hand: 'yoraSkull',
      board: 'novice',
    },
    inactivePlayer: { board: 'zombie' },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const opponentId = initialState.playerOrder[1]
  const skullId = initialState.players[playerId].hand[0]
  const opponentCardId = initialState.players[opponentId].board[0]
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: skullId,
      cardBaseId: 'yoraSkull',
    }),
  )
  store.dispatch(
    selectCardEffectTarget({ targetCardInstanceId: opponentCardId }),
  )

  expect(store.getState().duel.pendingPlayedCardId).toBe(skullId)
  expect(store.getState().duel.cards[opponentCardId]).toMatchObject({ life: 1 })
})

test("Saint Yora's Skull skips the adjacent buff when boards are tied", () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 4,
      hand: 'yoraSkull',
      board: ['novice', 'acolyte'],
    },
    inactivePlayer: { board: ['zombie', 'haunt'] },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const player = initialState.players[playerId]
  const skullId = player.hand[0]
  const [noviceId, acolyteId] = player.board
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: skullId,
      cardBaseId: 'yoraSkull',
    }),
  )
  store.dispatch(selectCardEffectTarget({ targetCardInstanceId: noviceId }))

  expect(store.getState().duel.cards[noviceId]).toMatchObject({ life: 3 })
  expect(store.getState().duel.cards[acolyteId]).toMatchObject({ life: 2 })
})

test("Saint Yora's Skull ignores non-character adjacent cards", () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 4,
      hand: 'yoraSkull',
      board: ['novice', 'bookOfAsh'],
    },
    inactivePlayer: { board: ['zombie', 'haunt', 'zombie'] },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const player = initialState.players[playerId]
  const skullId = player.hand[0]
  const [noviceId, bookId] = player.board
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: skullId,
      cardBaseId: 'yoraSkull',
    }),
  )
  store.dispatch(selectCardEffectTarget({ targetCardInstanceId: noviceId }))

  const state = store.getState().duel

  expect(state.cards[noviceId]).toMatchObject({ life: 3 })
  expect(state.cards[bookId]).toMatchObject({
    baseId: 'bookOfAsh',
    stack: 'board',
  })
})

test("Saint Yora's Skull effect resolves without buffs when required state is missing", () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 4,
      hand: 'yoraSkull',
      board: 'novice',
    },
    inactivePlayer: { board: ['zombie', 'haunt'] },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const targetCardInstanceId = initialState.players[playerId].board[0]
  const skullId = initialState.players[playerId].hand[0]
  const playedState = duelReducer(
    initialState,
    playCard({ playerId, cardInstanceId: skullId, cardBaseId: 'yoraSkull' }),
  )
  const action = selectCardEffectTarget({ targetCardInstanceId })
  const missingSkullState = structuredClone(playedState)
  const missingOpponentIdState = structuredClone(playedState)
  const missingTargetState = structuredClone(playedState)

  delete missingSkullState.cards[skullId]
  missingOpponentIdState.playerOrder = [playerId, playerId]
  delete missingTargetState.cards[targetCardInstanceId]

  const states = [
    missingSkullState,
    missingOpponentIdState,
    missingTargetState,
  ]

  states.forEach((duel) => {
    const dispatch = vi.fn()

    orderEffects[3].run({
      action,
      previousState: { duel: initialState },
      state: { duel: playedState },
      dispatch,
      getState: () => ({ duel }),
    })

    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith(
      resolvePendingPlayedCard({ cardInstanceId: skullId }),
    )
  })
})

test('Novice effect safely ignores a missing character or owner', () => {
  const initialState = setupMockedDuel({ activePlayer: { hand: 'novice' } })
  const playerId = initialState.playerOrder[0]
  const noviceId = initialState.players[playerId].hand[0]
  const action = summonCard({
    playerId,
    cardInstanceId: noviceId,
    from: 'hand',
  })
  const enteredState = duelReducer(initialState, action)
  const missingCardState = structuredClone(enteredState)
  const missingPlayerState = structuredClone(enteredState)

  delete missingCardState.cards[noviceId]
  delete missingPlayerState.players[playerId]

  const missingCardDispatch = vi.fn()
  orderEffects[0].run({
    action,
    previousState: { duel: initialState },
    state: { duel: enteredState },
    dispatch: missingCardDispatch,
    getState: () => ({ duel: missingCardState }),
  })
  const missingPlayerDispatch = vi.fn()
  orderEffects[0].run({
    action,
    previousState: { duel: initialState },
    state: { duel: enteredState },
    dispatch: missingPlayerDispatch,
    getState: () => ({ duel: missingPlayerState }),
  })

  expect(missingCardDispatch).not.toHaveBeenCalled()
  expect(missingPlayerDispatch).not.toHaveBeenCalled()
})

test('Temple Guard effect safely handles absent opponent identities and players', () => {
  const initialState = setupMockedDuel({
    activePlayer: { hand: 'templeGuard' },
    inactivePlayer: { board: ['zombie', 'haunt'] },
  })
  const [playerId, opponentId] = initialState.playerOrder
  const guardId = initialState.players[playerId].hand[0]
  const action = summonCard({
    playerId,
    cardInstanceId: guardId,
    from: 'hand',
  })
  const enteredState = duelReducer(initialState, action)
  const missingOpponentIdState = structuredClone(enteredState)
  const missingOpponentState = structuredClone(enteredState)

  missingOpponentIdState.playerOrder = [playerId, playerId]
  delete missingOpponentState.players[opponentId]

  const missingOpponentIdDispatch = vi.fn()
  orderEffects[1].run({
    action,
    previousState: { duel: initialState },
    state: { duel: enteredState },
    dispatch: missingOpponentIdDispatch,
    getState: () => ({ duel: missingOpponentIdState }),
  })
  const missingOpponentDispatch = vi.fn()
  orderEffects[1].run({
    action,
    previousState: { duel: initialState },
    state: { duel: enteredState },
    dispatch: missingOpponentDispatch,
    getState: () => ({ duel: missingOpponentState }),
  })

  expect(missingOpponentIdDispatch).not.toHaveBeenCalled()
  expect(missingOpponentDispatch).not.toHaveBeenCalled()
})
