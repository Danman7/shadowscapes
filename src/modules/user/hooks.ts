import { useContext } from 'react'

import { messages } from 'src/i18n/indext'
import { UserContext } from 'src/modules/user/UserContext'

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error(messages.user.contextError)
  return context
}
