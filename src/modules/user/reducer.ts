import { UserAction, UserState } from 'src/modules/user/types'

export const initialState: UserState = null

export const userReducer = (
  state: UserState,
  action: UserAction,
): UserState => {
  switch (action.type) {
    case 'LOAD_USER': {
      return action.user
    }

    default:
      return state
  }
}
