import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit'

import { createCardInstance } from 'src/game-engine/cards'
import { getCardsInStack } from 'src/game-engine/utils'
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
  card.attributes.stunnedTurnsRemaining = Math.max(
    card.attributes.stunnedTurnsRemaining ?? 0,
    1,
  )
  card.didAct = true

  state.logs.push(
    formatString(messages.reducer.stunned, {
      cardName: card.base.name,
    }),
  )
}

export const applyBookOfAsh: CaseReducer<
  Duel,
  PayloadAction<{ targetCardInstanceId: string }>
> = (state, action) => {
  const activePlayer = state.players[state.playerOrder[0]]
  const sourceCard = state.cards[action.payload.targetCardInstanceId]

  state.pendingInstant = null
  state.pendingCharacterAbility = null

  if (!sourceCard) return
  if (sourceCard.base.isElite === true) return

  const copiedCard = createCardInstance(sourceCard.base.id)
  copiedCard.attributes.isStunned = !copiedCard.attributes.hasHaste
  state.cards[copiedCard.id] = copiedCard
  activePlayer.board.push(copiedCard.id)

  if (copiedCard.base.id !== 'zombie') return

  const zombiesInDiscard = getCardsInStack(
    activePlayer.discard,
    state.cards,
    (card) => {
      return card.base.id === 'zombie'
    },
  )

  if (zombiesInDiscard.length === 0) return

  for (const zombieId of zombiesInDiscard) {
    const zombieCard = state.cards[zombieId]
    if (!zombieCard) continue

    zombieCard.attributes.isStunned = true
  }

  activePlayer.discard = activePlayer.discard.filter((id) => {
    return !zombiesInDiscard.includes(id)
  })
  activePlayer.board.push(...zombiesInDiscard)

  state.logs.push(
    formatString(messages.cardEffects.zombieResurrect, {
      count: zombiesInDiscard.length,
    }),
  )
}
