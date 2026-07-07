import { createAppStore } from '../../redux'
import { setupMockedDuel } from '../../user'
import {
  attackCharacter,
  passActTurn,
  playCard,
} from '../state'
import { selectCardEffectTarget } from './targetedCardEffect'

test('Zombie summons the last discarded Zombie for free on play', () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 1,
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
    coins: 0,
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
      coins: 1,
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

test('Book of Ash summons a one-life copy of a selected discarded character', () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 3,
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
