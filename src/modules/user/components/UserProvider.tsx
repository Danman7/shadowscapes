import { useReducer } from 'react'

import { initialState, userReducer } from 'src/modules/user/reducer'
import { UserState } from 'src/modules/user/types'
import { UserContext } from 'src/modules/user/UserContext'

export interface UserProviderProps {
  children: React.ReactNode
  preloadedState?: UserState
}

export const UserProvider: React.FC<UserProviderProps> = ({
  children,
  preloadedState,
}) => {
  const [state, dispatch] = useReducer(
    userReducer,
    preloadedState || initialState,
  )

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  )
}
