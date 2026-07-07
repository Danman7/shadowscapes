import { setupMockedDuel } from '../../../user'
import { getAdjacentBoardCardIds } from './getAdjacentBoardCardIds'

test('returns no adjacent cards for missing or unowned board cards', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'novice', hand: 'acolyte' },
  })
  const playerId = state.playerOrder[0]
  const handCardId = state.players[playerId].hand[0]
  const missingPlayerState = structuredClone(state)

  delete missingPlayerState.players[playerId]

  expect(getAdjacentBoardCardIds(state, 'missing')).toEqual([])
  expect(getAdjacentBoardCardIds(missingPlayerState, handCardId)).toEqual([])
  expect(getAdjacentBoardCardIds(state, handCardId)).toEqual([])
})
