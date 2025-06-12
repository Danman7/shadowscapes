import { mockOrderUser } from 'src/modules/user/mocks'
import { initialState, userReducer } from 'src/modules/user/reducer'
import { LoadUserAction, UserAction } from 'src/modules/user/types'

describe('User Reducer', () => {
  it('should return current state for unknown actions', () => {
    const action = { type: 'UNKNOWN_ACTION' } as unknown as UserAction

    const newState = userReducer(initialState, action)

    expect(newState).toBe(initialState)
  })

  it('should load user data when LOAD_USER is dispatched', () => {
    const action: LoadUserAction = {
      type: 'LOAD_USER',
      user: mockOrderUser,
    }

    const newState = userReducer(initialState, action)

    expect(newState).toEqual(mockOrderUser)
  })
})
