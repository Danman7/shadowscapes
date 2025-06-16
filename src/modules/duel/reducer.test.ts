import { allCardBases } from 'src/modules/cards/bases'
import { STARTING_COINS } from 'src/modules/duel/constants'
import { duelReducer, initialState } from 'src/modules/duel/reducer'
import {
  DuelAction,
  DuelStartingUsers,
  InitialiseDuelAction,
} from 'src/modules/duel/types'
import { mockChaosUser, mockOrderUser } from 'src/modules/user/mocks'

describe('Duel Reducer', () => {
  it('should return current state for unknown actions', () => {
    const action = { type: 'UNKNOWN_ACTION' } as unknown as DuelAction

    const newState = duelReducer(initialState, action)

    expect(newState).toBe(initialState)
  })

  it('should convert users to players when INITIALISE_DUEL is dispatched', () => {
    const users: DuelStartingUsers = [mockOrderUser, mockChaosUser]

    const action: InitialiseDuelAction = {
      type: 'INITIALISE_DUEL',
      users,
    }

    const { players, cards } = duelReducer(initialState, action)

    users.forEach(({ id, name, draftDeck }) => {
      expect(players[id]).toEqual(
        expect.objectContaining({
          id,
          name,
          income: 0,
          coins: STARTING_COINS,
        }),
      )

      const allDuelCards = Object.values(cards)

      draftDeck.forEach((cardName) => {
        expect(
          allDuelCards.some(
            (card) => card.name === allCardBases[cardName].name,
          ),
        ).toBe(true)
      })
    })
  })
})
