import { UserAction, UserState } from 'src/modules/user/types'

export const initialState: UserState = {
  user: {
    id: '',
    name: '',
    deck: [],
  },
  isUserLoaded: false,
}

export const userReducer = (
  state: UserState,
  action: UserAction,
): UserState => {
  switch (action.type) {
    case 'LOAD_USER': {
      const { user } = action

      return {
        ...state,
        user,
        isUserLoaded: true,
      }
    }

    default:
      return state
  }
}
