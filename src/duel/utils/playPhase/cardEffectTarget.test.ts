import { setupMockedDuel } from '../../../user'
import { canCardBeEffectTarget, hasCardEffectTarget } from './cardEffectTarget'

test('hasCardEffectTarget returns false for a missing player', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    phase: 'play',
  })

  expect(hasCardEffectTarget(state, 'yoraSkull', 'missing-player')).toBe(false)
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
