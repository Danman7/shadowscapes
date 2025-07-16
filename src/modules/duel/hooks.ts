import { useContext } from 'react'

import { messages } from 'src/i18n'
import { DuelContext } from 'src/modules/duel/DuelContext'

export const useDuel = () => {
  const context = useContext(DuelContext)
  if (!context) throw new Error(messages.duel.contextError)
  return context
}
