import { createAppStore } from '../../redux'
import { setupMockedDuel } from '../../user'
import { attackCharacter, passActTurn, playCard, summonCard } from '../state'
import { chaosEffects } from './chaosEffects'
import { selectCardEffectTarget } from './targetedCardEffect'

test('Zombie summons the last discarded Zombie for free on play', () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 2,
      hand: 'zombie',
      discard: ['zombie', 'haunt'],
    },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const playedZombieId = initialState.players[playerId].hand[0]
  const discardedZombieId = initialState.players[playerId].discard[0]
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: playedZombieId,
      cardBaseId: 'zombie',
    }),
  )

  const state = store.getState().duel

  expect(state.players[playerId]).toMatchObject({
    coins: 1,
    hand: [],
    board: [playedZombieId, discardedZombieId],
    discard: [initialState.players[playerId].discard[1]],
  })
  expect(state.cards[discardedZombieId]).toMatchObject({
    stack: 'board',
    turnsStunned: 1,
  })
})

test('Zombie safely skips its summon without a discarded Zombie', () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 2,
      hand: 'zombie',
      discard: 'haunt',
    },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const playedZombieId = initialState.players[playerId].hand[0]
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: playedZombieId,
      cardBaseId: 'zombie',
    }),
  )

  expect(store.getState().duel.players[playerId]).toMatchObject({
    board: [playedZombieId],
    discard: initialState.players[playerId].discard,
  })
})

test('Zombie safely skips its summon when effect state has no player', () => {
  const previousDuel = setupMockedDuel({
    activePlayer: { hand: 'zombie' },
  })
  const playerId = previousDuel.playerOrder[0]
  const zombieId = previousDuel.players[playerId].hand[0]
  const stateDuel = structuredClone(previousDuel)
  const getStateDuel = structuredClone(previousDuel)
  const dispatch = vi.fn()

  stateDuel.players[playerId].hand = []
  stateDuel.players[playerId].board = [zombieId]
  stateDuel.cards[zombieId].stack = 'board'
  delete getStateDuel.players[playerId]

  chaosEffects[0].run({
    action: summonCard({ playerId, cardInstanceId: zombieId, from: 'hand' }),
    previousState: { duel: previousDuel },
    state: { duel: stateDuel },
    dispatch,
    getState: () => ({ duel: getStateDuel }),
  })

  expect(dispatch).not.toHaveBeenCalled()
})

test('Viktoria gains life in every stack whenever her owner plays a Beast', () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 3,
      deck: 'viktoriaQueen',
      hand: ['viktoriaQueen', 'burrick'],
      board: 'viktoriaQueen',
      discard: 'viktoriaQueen',
    },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const player = initialState.players[playerId]
  const viktoriaIds = [
    player.deck[0],
    player.hand[0],
    player.board[0],
    player.discard[0],
  ]
  const burrickId = player.hand[1]
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: burrickId,
      cardBaseId: 'burrick',
    }),
  )

  const state = store.getState().duel

  viktoriaIds.forEach((cardId) => {
    expect(state.cards[cardId]).toMatchObject({ life: 3 })
  })
  expect(state.cards[viktoriaIds[1]]).toMatchObject({
    stack: 'hand',
  })
})

test('Viktoria gains life when a Beast is summoned but ignores other cards', () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      hand: ['burrick', 'zombie'],
      board: 'viktoriaQueen',
    },
  })
  const playerId = initialState.playerOrder[0]
  const player = initialState.players[playerId]
  const viktoriaId = player.board[0]
  const burrickId = player.hand.find(
    (cardId) => initialState.cards[cardId].baseId === 'burrick',
  )!
  const zombieId = player.hand.find(
    (cardId) => initialState.cards[cardId].baseId === 'zombie',
  )!
  const store = createAppStore(initialState)

  store.dispatch(
    summonCard({ playerId, cardInstanceId: zombieId, from: 'hand' }),
  )
  store.dispatch(
    summonCard({ playerId, cardInstanceId: burrickId, from: 'hand' }),
  )

  expect(store.getState().duel.cards[viktoriaId]).toMatchObject({ life: 3 })
})

test('Book of Ash summons a one-life copy of a selected discarded character', () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 4,
      hand: 'bookOfAsh',
      discard: 'haunt',
    },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const bookId = initialState.players[playerId].hand[0]
  const sourceCardInstanceId = initialState.players[playerId].discard[0]
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: bookId,
      cardBaseId: 'bookOfAsh',
    }),
  )

  expect(store.getState().duel.pendingPlayedCardId).toBe(bookId)

  store.dispatch(
    selectCardEffectTarget({ targetCardInstanceId: sourceCardInstanceId }),
  )

  const state = store.getState().duel
  const copyId = state.players[playerId].board[0]

  expect(copyId).not.toBe(sourceCardInstanceId)
  expect(state.players[playerId]).toMatchObject({
    board: [copyId],
    discard: [sourceCardInstanceId, bookId],
  })
  expect(state.cards[sourceCardInstanceId]).toMatchObject({
    baseId: 'haunt',
    stack: 'discard',
  })
  expect(state.cards[copyId]).toMatchObject({
    baseId: 'haunt',
    life: 1,
    stack: 'board',
    turnsStunned: 1,
  })
  expect(state.cards[bookId]).toMatchObject({ stack: 'discard' })
  expect(state.pendingPlayedCardId).toBeNull()
})

test('Book of Ash targeted effect ignores missing books and invalid targets', () => {
  const state = setupMockedDuel({
    activePlayer: {
      board: 'bookOfAsh',
      discard: 'haunt',
    },
    phase: 'play',
  })
  const playerId = state.playerOrder[0]
  const bookId = state.players[playerId].board[0]
  const targetId = state.players[playerId].discard[0]
  const action = selectCardEffectTarget({ targetCardInstanceId: targetId })
  const missingBookDuel = structuredClone(state)
  const invalidTargetDuel = structuredClone(state)
  const missingBookDispatch = vi.fn()
  const invalidTargetDispatch = vi.fn()

  state.pendingPlayedCardId = bookId
  missingBookDuel.pendingPlayedCardId = bookId
  invalidTargetDuel.pendingPlayedCardId = bookId
  delete missingBookDuel.cards[bookId]
  invalidTargetDuel.cards[targetId].type = 'instance'

  chaosEffects[1].run({
    action,
    previousState: { duel: state },
    state: { duel: state },
    dispatch: missingBookDispatch,
    getState: () => ({ duel: missingBookDuel }),
  })
  chaosEffects[1].run({
    action,
    previousState: { duel: state },
    state: { duel: state },
    dispatch: invalidTargetDispatch,
    getState: () => ({ duel: invalidTargetDuel }),
  })

  expect(missingBookDispatch).not.toHaveBeenCalledWith(
    expect.objectContaining({ type: 'duel/summonCardCopy' }),
  )
  expect(invalidTargetDispatch).not.toHaveBeenCalledWith(
    expect.objectContaining({ type: 'duel/summonCardCopy' }),
  )
})

test("Burrick spends a charge to damage the target's adjacent cards", () => {
  const initialState = setupMockedDuel({
    activePlayer: { board: 'burrick' },
    inactivePlayer: { board: ['zombie', 'haunt', 'zombie'] },
    phase: 'act',
  })
  const [attackerPlayerId, defenderPlayerId] = initialState.playerOrder
  const attackerId = initialState.players[attackerPlayerId].board[0]
  const [leftZombieId, defenderId, rightZombieId] =
    initialState.players[defenderPlayerId].board
  const store = createAppStore(initialState)

  store.dispatch(attackCharacter({ attackerId, defenderId }))

  const state = store.getState().duel

  expect(state.cards[attackerId]).toMatchObject({
    baseId: 'burrick',
    charges: 0,
    didAct: true,
  })
  expect(state.cards[defenderId]).toMatchObject({ life: 2, stack: 'board' })
  expect(state.players[defenderPlayerId]).toMatchObject({
    board: [defenderId],
    discard: [leftZombieId, rightZombieId],
  })
})

test('Burrick attack effect ignores unrelated and invalid attack actions', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'burrick' },
    inactivePlayer: { board: 'zombie' },
    phase: 'act',
  })
  const [attackerPlayerId, defenderPlayerId] = state.playerOrder
  const attackerId = state.players[attackerPlayerId].board[0]
  const defenderId = state.players[defenderPlayerId].board[0]
  const invalidAttackState = { ...state, phase: 'play' as const }
  const unrelatedDispatch = vi.fn()
  const invalidAttackDispatch = vi.fn()

  chaosEffects[2].run({
    action: { type: 'unrelated' },
    previousState: { duel: state },
    state: { duel: state },
    dispatch: unrelatedDispatch,
    getState: () => ({ duel: state }),
  })
  chaosEffects[2].run({
    action: attackCharacter({ attackerId, defenderId }),
    previousState: { duel: invalidAttackState },
    state: { duel: invalidAttackState },
    dispatch: invalidAttackDispatch,
    getState: () => ({ duel: invalidAttackState }),
  })

  expect(unrelatedDispatch).not.toHaveBeenCalled()
  expect(invalidAttackDispatch).not.toHaveBeenCalled()
})

test('Burrick attack effect ignores valid attacks from non-Burrick characters', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    phase: 'act',
  })
  const [attackerPlayerId, defenderPlayerId] = state.playerOrder
  const attackerId = state.players[attackerPlayerId].board[0]
  const defenderId = state.players[defenderPlayerId].board[0]
  const dispatch = vi.fn()

  chaosEffects[2].run({
    action: attackCharacter({ attackerId, defenderId }),
    previousState: { duel: state },
    state: { duel: state },
    dispatch,
    getState: () => ({ duel: state }),
  })

  expect(dispatch).not.toHaveBeenCalled()
})

test('Burrick attack effect ignores invalid current attacker state', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'burrick' },
    inactivePlayer: { board: 'zombie' },
    phase: 'act',
  })
  const [attackerPlayerId, defenderPlayerId] = state.playerOrder
  const attackerId = state.players[attackerPlayerId].board[0]
  const defenderId = state.players[defenderPlayerId].board[0]
  const instanceAttackerState = structuredClone(state)
  const discardedAttackerState = structuredClone(state)
  const instanceDispatch = vi.fn()
  const discardedDispatch = vi.fn()

  instanceAttackerState.cards[attackerId].type = 'instance'
  discardedAttackerState.cards[attackerId].stack = 'discard'

  chaosEffects[2].run({
    action: attackCharacter({ attackerId, defenderId }),
    previousState: { duel: state },
    state: { duel: instanceAttackerState },
    dispatch: instanceDispatch,
    getState: () => ({ duel: instanceAttackerState }),
  })
  chaosEffects[2].run({
    action: attackCharacter({ attackerId, defenderId }),
    previousState: { duel: state },
    state: { duel: discardedAttackerState },
    dispatch: discardedDispatch,
    getState: () => ({ duel: discardedAttackerState }),
  })

  expect(instanceDispatch).not.toHaveBeenCalled()
  expect(discardedDispatch).not.toHaveBeenCalled()
})

test('Burrick ignores adjacent non-character cards', () => {
  const initialState = setupMockedDuel({
    activePlayer: { board: 'burrick' },
    inactivePlayer: { board: ['zombie', 'haunt', 'bookOfAsh'] },
    phase: 'act',
  })
  const [attackerPlayerId, defenderPlayerId] = initialState.playerOrder
  const attackerId = initialState.players[attackerPlayerId].board[0]
  const [leftZombieId, defenderId, bookId] =
    initialState.players[defenderPlayerId].board
  const store = createAppStore(initialState)

  store.dispatch(attackCharacter({ attackerId, defenderId }))

  const state = store.getState().duel

  expect(state.cards[leftZombieId]).toMatchObject({ stack: 'discard' })
  expect(state.cards[bookId]).toMatchObject({
    baseId: 'bookOfAsh',
    stack: 'board',
  })
})

test('Burrick does not splash damage without a charge', () => {
  const initialState = setupMockedDuel({
    activePlayer: { board: 'burrick' },
    inactivePlayer: { board: ['zombie', 'haunt', 'zombie'] },
    phase: 'act',
  })
  const [attackerPlayerId, defenderPlayerId] = initialState.playerOrder
  const attackerId = initialState.players[attackerPlayerId].board[0]
  const defenderId = initialState.players[defenderPlayerId].board[1]
  const preparedState = structuredClone(initialState)

  if (preparedState.cards[attackerId].type !== 'character') {
    throw new Error('Expected a Burrick character')
  }
  preparedState.cards[attackerId].charges = 0

  const store = createAppStore(preparedState)

  store.dispatch(attackCharacter({ attackerId, defenderId }))

  expect(store.getState().duel.cards[attackerId]).toMatchObject({
    charges: 0,
  })
  expect(store.getState().duel.players[defenderPlayerId].board).toEqual(
    initialState.players[defenderPlayerId].board,
  )
})

test('Burrick gains a charge when it passes while ready to act', () => {
  const initialState = setupMockedDuel({
    activePlayer: { board: ['burrick', 'zombie'] },
    phase: 'act',
  })
  const playerId = initialState.playerOrder[0]
  const [burrickId, zombieId] = initialState.players[playerId].board
  const preparedState = structuredClone(initialState)

  if (preparedState.cards[burrickId].type !== 'character') {
    throw new Error('Expected a Burrick character')
  }
  preparedState.cards[burrickId].charges = 0

  const store = createAppStore(preparedState)

  store.dispatch(passActTurn())

  expect(store.getState().duel.cards[burrickId]).toMatchObject({
    charges: 1,
  })
  expect(store.getState().duel.cards[zombieId]).not.toHaveProperty('charges')
})

test('Burrick does not gain a charge when it was stunned during the pass', () => {
  const initialState = setupMockedDuel({
    activePlayer: { board: ['burrick', 'zombie'] },
    phase: 'act',
  })
  const playerId = initialState.playerOrder[0]
  const [burrickId] = initialState.players[playerId].board
  const preparedState = structuredClone(initialState)

  if (preparedState.cards[burrickId].type !== 'character') {
    throw new Error('Expected a Burrick character')
  }
  preparedState.cards[burrickId].charges = 0
  preparedState.cards[burrickId].turnsStunned = 1

  const store = createAppStore(preparedState)

  store.dispatch(passActTurn())

  expect(store.getState().duel.cards[burrickId]).toMatchObject({
    charges: 0,
  })
})
