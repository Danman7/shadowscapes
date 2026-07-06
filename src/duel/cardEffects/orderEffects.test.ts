import { createAppStore } from '../../redux'
import { setupMockedDuel } from '../../user'
import { duelReducer, playCard, summonCard } from '../state'
import { orderEffects } from './orderEffects'

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
    activePlayer: { coins: 3, hand: 'templeGuard' },
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
    activePlayer: { coins: 3, hand: 'templeGuard' },
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
