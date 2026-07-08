import { mockChaosUser, mockOrderUser, setupMockedDuel } from '../../user'
import {
  getTablePlayerIds,
  isPlayerAiControlled,
  isPlayerHumanControlled,
} from './duelMode'

const soloMode = {
  type: 'solo-random-ai',
  humanPlayerId: mockOrderUser.id,
  aiPlayerId: mockChaosUser.id,
} as const

test('hot-seat table seats follow the active player order', () => {
  const state = setupMockedDuel()

  expect(getTablePlayerIds(state)).toEqual({
    bottomPlayerId: mockOrderUser.id,
    topPlayerId: mockChaosUser.id,
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  expect(getTablePlayerIds(state)).toEqual({
    bottomPlayerId: mockChaosUser.id,
    topPlayerId: mockOrderUser.id,
  })
})

test('solo random AI table seats pin the human bottom and AI top', () => {
  const state = setupMockedDuel({ mode: soloMode })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  expect(getTablePlayerIds(state)).toEqual({
    bottomPlayerId: mockOrderUser.id,
    topPlayerId: mockChaosUser.id,
  })
})

test('identifies human and AI controlled players', () => {
  const hotSeatState = setupMockedDuel()
  const soloState = setupMockedDuel({ mode: soloMode })

  expect(isPlayerHumanControlled(hotSeatState, mockOrderUser.id)).toBe(true)
  expect(isPlayerHumanControlled(hotSeatState, mockChaosUser.id)).toBe(true)
  expect(isPlayerHumanControlled(soloState, mockOrderUser.id)).toBe(true)
  expect(isPlayerHumanControlled(soloState, mockChaosUser.id)).toBe(false)
  expect(isPlayerAiControlled(soloState, mockOrderUser.id)).toBe(false)
  expect(isPlayerAiControlled(soloState, mockChaosUser.id)).toBe(true)
})

test('missing players are not human controlled', () => {
  expect(isPlayerHumanControlled(setupMockedDuel(), 'missing')).toBe(false)
})
