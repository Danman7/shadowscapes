import { setupMockedDuel } from '../../user'
import { isPendingPlayedCardAnInstance } from './playPhase'

test('does not find a pending instance when no card is pending', () => {
  const state = setupMockedDuel({ phase: 'play' })

  expect(
    isPendingPlayedCardAnInstance(state, state.playerOrder[0]),
  ).toBe(false)
})
