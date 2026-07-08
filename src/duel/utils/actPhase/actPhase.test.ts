import { setupMockedDuel } from '../../../user'
import { canActPlayerPass } from './canActPlayerPass'
import { canCharacterAttack } from './canCharacterAttack'
import { getReadyCharacters } from './getReadyCharacters'

const setupAttack = () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'haunt' },
    phase: 'act',
  })
  const [attackerPlayerId, defenderPlayerId] = state.playerOrder

  return {
    state,
    attackerId: state.players[attackerPlayerId].board[0],
    defenderId: state.players[defenderPlayerId].board[0],
    attackerPlayerId,
    defenderPlayerId,
  }
}

test('rejects attacks outside act or without an acting player', () => {
  const { state, attackerId, defenderId } = setupAttack()

  expect(
    canCharacterAttack({ ...state, phase: 'play' }, { attackerId, defenderId }),
  ).toBe(false)
  expect(
    canCharacterAttack(
      { ...state, actPlayerId: null },
      { attackerId, defenderId },
    ),
  ).toBe(false)
})

test('rejects missing attackers, defenders, and their players', () => {
  const {
    state,
    attackerId,
    defenderId,
    attackerPlayerId,
    defenderPlayerId,
  } = setupAttack()

  expect(canCharacterAttack(state, { attackerId: 'missing', defenderId })).toBe(
    false,
  )
  expect(canCharacterAttack(state, { attackerId, defenderId: 'missing' })).toBe(
    false,
  )

  const missingAttackerPlayer = structuredClone(state)
  delete missingAttackerPlayer.players[attackerPlayerId]
  expect(
    canCharacterAttack(missingAttackerPlayer, { attackerId, defenderId }),
  ).toBe(false)

  const missingDefenderPlayer = structuredClone(state)
  delete missingDefenderPlayer.players[defenderPlayerId]
  expect(
    canCharacterAttack(missingDefenderPlayer, { attackerId, defenderId }),
  ).toBe(false)
})

test('accepts a valid character attack', () => {
  const { state, attackerId, defenderId } = setupAttack()

  expect(canCharacterAttack(state, { attackerId, defenderId })).toBe(true)
})

test('returns no ready characters for a missing player', () => {
  expect(getReadyCharacters(setupMockedDuel(), 'missing')).toEqual([])
})

test('rejects act pass without a valid acting player', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    phase: 'act',
  })
  const missingPlayerState = structuredClone(state)

  missingPlayerState.actPlayerId = 'missing'

  expect(canActPlayerPass({ ...state, actPlayerId: null })).toBe(false)
  expect(canActPlayerPass(missingPlayerState)).toBe(false)
})
