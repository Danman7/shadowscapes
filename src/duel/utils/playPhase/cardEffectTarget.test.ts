import { setupMockedDuel } from '../../../user'
import { hasCardEffectTarget } from './cardEffectTarget'

test('hasCardEffectTarget returns false for a missing player', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    phase: 'play',
  })

  expect(hasCardEffectTarget(state, 'yoraSkull', 'missing-player')).toBe(false)
})
