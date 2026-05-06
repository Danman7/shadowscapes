import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit'

import type { Duel, PendingInstant } from 'src/game-engine/types'
import { formatString, messages } from 'src/i18n'

export const setPendingInstant: CaseReducer<
  Duel,
  PayloadAction<{ pendingInstant: PendingInstant | null }>
> = (state, action) => {
  state.pendingInstant = action.payload.pendingInstant
}

export const applySpeedPotion: CaseReducer<
  Duel,
  PayloadAction<{ targetCardInstanceId: string }>
> = (state, action) => {
  const { targetCardInstanceId } = action.payload
  const card = state.cards[targetCardInstanceId]

  if (!card) return

  state.pendingInstant = null
  state.pendingCharacterAbility = null
  card.attributes.hasHaste = true

  state.logs.push(
    formatString(messages.reducer.gainsHaste, {
      cardName: card.base.name,
    }),
  )
}

export const applyFlashBomb: CaseReducer<
  Duel,
  PayloadAction<{ targetCardInstanceId: string }>
> = (state, action) => {
  const { targetCardInstanceId } = action.payload
  const card = state.cards[targetCardInstanceId]

  if (!card) return

  state.pendingInstant = null
  state.pendingCharacterAbility = null
  card.attributes.isStunned = true
  card.didAct = true

  state.logs.push(
    formatString(messages.reducer.stunned, {
      cardName: card.base.name,
    }),
  )
}
