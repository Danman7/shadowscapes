import { createContext } from 'react'

import { UserAction, UserState } from 'src/modules/user/types'

export const UserContext = createContext<
  { state: UserState; dispatch: React.Dispatch<UserAction> } | undefined
>(undefined)
