import { mockChaosUser, mockOrderUser, setupMockedDuel } from '../../user'
import {
  getRandomAiAttackPairs,
  getRandomAiPlayableCardIds,
  shouldRandomAiPassPlayTurn,
} from './randomAi'

const soloMode = {
  type: 'solo-random-ai',
  humanPlayerId: mockOrderUser.id,
  aiPlayerId: mockChaosUser.id,
} as const

test('finds only playable AI cards within coins and target rules', () => {
  const state = setupMockedDuel({
    inactivePlayer: {
      coins: 3,
      hand: ['zombie', 'bookOfAsh', 'yoraSkull', 'haunt'],
    },
    mode: soloMode,
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  const playableBaseIds = getRandomAiPlayableCardIds(
    state,
    mockChaosUser.id,
  ).map((cardId) => state.cards[cardId].baseId)

  expect(playableBaseIds).toEqual(['zombie', 'haunt'])
})

test('returns no playable AI cards for a missing player', () => {
  expect(getRandomAiPlayableCardIds(setupMockedDuel(), 'missing')).toEqual([])
})

test('detects when the AI board lead is at least three cards', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: ['zombie', 'zombie', 'haunt', 'burrick'] },
    mode: soloMode,
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  expect(shouldRandomAiPassPlayTurn(state, mockChaosUser.id)).toBe(true)

  state.players[mockChaosUser.id].board.pop()

  expect(shouldRandomAiPassPlayTurn(state, mockChaosUser.id)).toBe(false)
})

test('does not pass play without both AI and opponent players', () => {
  const state = setupMockedDuel({
    inactivePlayer: { board: ['zombie', 'zombie', 'haunt', 'burrick'] },
    mode: soloMode,
    phase: 'play',
  })

  expect(shouldRandomAiPassPlayTurn(state, 'missing')).toBe(false)

  const missingOpponentState = structuredClone(state)

  delete missingOpponentState.players[mockOrderUser.id]

  expect(
    shouldRandomAiPassPlayTurn(missingOpponentState, mockChaosUser.id),
  ).toBe(false)

  const missingOpponentIdState = structuredClone(state)

  missingOpponentIdState.playerOrder = [mockChaosUser.id, mockChaosUser.id]

  expect(
    shouldRandomAiPassPlayTurn(missingOpponentIdState, mockChaosUser.id),
  ).toBe(false)
})

test('finds valid random AI attack pairs', () => {
  const state = setupMockedDuel({
    activePlayer: { board: ['novice', 'yoraSkull'] },
    inactivePlayer: { board: ['zombie', 'bookOfAsh'] },
    mode: soloMode,
    phase: 'act',
  })

  state.actPlayerId = mockChaosUser.id

  expect(getRandomAiAttackPairs(state, mockChaosUser.id)).toEqual([
    {
      attackerId: state.players[mockChaosUser.id].board[0],
      defenderId: state.players[mockOrderUser.id].board[0],
    },
  ])
})

test('returns no AI attack pairs outside the active act turn', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    mode: soloMode,
    phase: 'play',
  })

  expect(getRandomAiAttackPairs(state, mockChaosUser.id)).toEqual([])

  const wrongActorState = { ...state, phase: 'act' as const }

  wrongActorState.actPlayerId = mockOrderUser.id

  expect(getRandomAiAttackPairs(wrongActorState, mockChaosUser.id)).toEqual([])
})

test('returns no AI attack pairs without both attacker and opponent players', () => {
  const missingPlayerState = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    mode: soloMode,
    phase: 'act',
  })

  missingPlayerState.actPlayerId = 'missing'

  expect(getRandomAiAttackPairs(missingPlayerState, 'missing')).toEqual([])

  const missingOpponentState = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    mode: soloMode,
    phase: 'act',
  })

  missingOpponentState.actPlayerId = mockChaosUser.id
  delete missingOpponentState.players[mockOrderUser.id]

  expect(getRandomAiAttackPairs(missingOpponentState, mockChaosUser.id)).toEqual(
    [],
  )

  const missingOpponentIdState = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    mode: soloMode,
    phase: 'act',
  })

  missingOpponentIdState.playerOrder = [mockChaosUser.id, mockChaosUser.id]
  missingOpponentIdState.actPlayerId = mockChaosUser.id

  expect(
    getRandomAiAttackPairs(missingOpponentIdState, mockChaosUser.id),
  ).toEqual([])
})
