import { useContext } from 'react'

import { messages } from '@/i18n'
import { DuelContext } from '@/state'

export const useDuel = () => {
  const context = useContext(DuelContext)
  if (!context) throw new Error(messages.duel.contextError)
  return context
}
