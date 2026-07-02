import { stacks } from '../duel/types'
import { setupMockedDuel } from './mocks'

test('creates isolated players and duel states', () => {
  const firstState = setupMockedDuel({
    activePlayer: { board: 'novice' },
  })
  const secondState = setupMockedDuel({
    inactivePlayer: { hand: 'zombie' },
  })

  const firstActivePlayer = firstState.players[firstState.playerOrder[0]]
  const firstInactivePlayer = firstState.players[firstState.playerOrder[1]]
  const secondActivePlayer = secondState.players[secondState.playerOrder[0]]
  const secondInactivePlayer = secondState.players[secondState.playerOrder[1]]

  expect(firstActivePlayer.board).toHaveLength(1)
  expect(firstInactivePlayer.hand).toHaveLength(0)
  expect(secondActivePlayer.board).toHaveLength(0)
  expect(secondInactivePlayer.hand).toHaveLength(1)

  Object.values(firstState.players).forEach((player) => {
    stacks.forEach((stack) => {
      player[stack].forEach((cardId) => {
        expect(firstState.cards[cardId]).toBeDefined()
      })
    })
  })
})
