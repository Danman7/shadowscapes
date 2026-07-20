import { setupMockedDuel } from '../../../user'
import { canCardBeEffectTarget, hasCardEffectTarget } from './cardEffectTarget'

test('hasCardEffectTarget returns false for a missing player', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    phase: 'play',
  })

  expect(hasCardEffectTarget(state, 'yoraSkull', 'missing-player')).toBe(false)
})

test('canCardBeEffectTarget rejects invalid pending and target state', () => {
  const state = setupMockedDuel({
    activePlayer: {
      board: ['yoraSkull', 'novice'],
    },
    phase: 'play',
  })
  const playerId = state.playerOrder[0]
  const [skullId, noviceId] = state.players[playerId].board

  state.pendingPlayedCardId = skullId

  expect(
    canCardBeEffectTarget({ ...state, phase: 'act' }, noviceId),
  ).toBe(false)
  expect(
    canCardBeEffectTarget(
      { ...state, pendingPlayedCardId: null },
      noviceId,
    ),
  ).toBe(false)
  expect(canCardBeEffectTarget(state, 'missing-card')).toBe(false)

  const pendingInHandState = setupMockedDuel({
    activePlayer: {
      hand: 'yoraSkull',
      board: 'novice',
    },
    phase: 'play',
  })
  const pendingInHandPlayerId = pendingInHandState.playerOrder[0]

  pendingInHandState.pendingPlayedCardId =
    pendingInHandState.players[pendingInHandPlayerId].hand[0]

  expect(
    canCardBeEffectTarget(
      pendingInHandState,
      pendingInHandState.players[pendingInHandPlayerId].board[0],
    ),
  ).toBe(false)
})

test('Book of Ash targets only owner discard characters', () => {
  const state = setupMockedDuel({
    activePlayer: {
      board: 'bookOfAsh',
      discard: ['bookOfAsh', 'haunt'],
    },
    inactivePlayer: { discard: 'zombie' },
    phase: 'play',
  })
  const [playerId, opponentId] = state.playerOrder
  const bookId = state.players[playerId].board[0]
  const [discardedInstanceId, discardedCharacterId] =
    state.players[playerId].discard
  const opponentDiscardedCharacterId = state.players[opponentId].discard[0]

  state.pendingPlayedCardId = bookId

  expect(hasCardEffectTarget(state, 'bookOfAsh', playerId)).toBe(true)
  expect(canCardBeEffectTarget(state, discardedCharacterId)).toBe(true)
  expect(canCardBeEffectTarget(state, discardedInstanceId)).toBe(false)
  expect(canCardBeEffectTarget(state, opponentDiscardedCharacterId)).toBe(false)
})

test('Speed Potion targets only allied characters in hand', () => {
  const state = setupMockedDuel({
    activePlayer: {
      hand: ['novice', 'yoraSkull'],
      board: 'speedPotion',
    },
    inactivePlayer: { hand: 'burrick' },
    phase: 'play',
  })
  const [playerId, opponentId] = state.playerOrder
  const potionId = state.players[playerId].board[0]
  const [alliedCharacterId, alliedInstanceId] = state.players[playerId].hand
  const enemyCharacterId = state.players[opponentId].hand[0]

  state.pendingPlayedCardId = potionId

  expect(hasCardEffectTarget(state, 'speedPotion', playerId)).toBe(true)
  expect(canCardBeEffectTarget(state, alliedCharacterId)).toBe(true)
  expect(canCardBeEffectTarget(state, alliedInstanceId)).toBe(false)
  expect(canCardBeEffectTarget(state, enemyCharacterId)).toBe(false)
})

test('Flash Bomb targets only enemy board characters', () => {
  const state = setupMockedDuel({
    activePlayer: { board: ['flashBomb', 'novice'] },
    inactivePlayer: { board: ['bookOfAsh', 'templeGuard'] },
    phase: 'play',
  })
  const [playerId, opponentId] = state.playerOrder
  const [bombId, alliedCharacterId] = state.players[playerId].board
  const [enemyInstanceId, enemyCharacterId] =
    state.players[opponentId].board

  state.pendingPlayedCardId = bombId

  expect(hasCardEffectTarget(state, 'flashBomb', playerId)).toBe(true)
  expect(canCardBeEffectTarget(state, enemyCharacterId)).toBe(true)
  expect(canCardBeEffectTarget(state, enemyInstanceId)).toBe(false)
  expect(canCardBeEffectTarget(state, alliedCharacterId)).toBe(false)
})

test('targeted neutral instances cannot be played without a valid target', () => {
  const state = setupMockedDuel({
    activePlayer: { hand: ['speedPotion', 'flashBomb', 'yoraSkull'] },
    inactivePlayer: { board: 'bookOfAsh' },
    phase: 'play',
  })
  const playerId = state.playerOrder[0]

  expect(hasCardEffectTarget(state, 'speedPotion', playerId)).toBe(false)
  expect(hasCardEffectTarget(state, 'flashBomb', playerId)).toBe(false)
})
