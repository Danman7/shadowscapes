import { createAction } from '@reduxjs/toolkit'

import type { CardBaseId } from '../../cards'
import { resolvePendingPlayedCard } from '../state'
import type { CardInstanceId } from '../types'
import { canCardBeEffectTarget } from '../utils'
import type {
  ActionEffectContext,
  ActionEffectRegistration,
} from './actionEffectsMiddleware'
import type { CardEffectsState } from './onPlayEffect'

export interface SelectCardEffectTargetPayload {
  targetCardInstanceId: CardInstanceId
}

export const selectCardEffectTarget =
  createAction<SelectCardEffectTargetPayload>('duel/selectCardEffectTarget')

interface TargetedCardEffectContext
  extends ActionEffectContext<CardEffectsState> {
  cardInstanceId: CardInstanceId
  targetCardInstanceId: CardInstanceId
}

type TargetedCardEffect = (context: TargetedCardEffectContext) => void

export const createTargetedCardEffect = (
  cardBaseId: CardBaseId,
  effect: TargetedCardEffect,
): ActionEffectRegistration<CardEffectsState> => ({
  matches: selectCardEffectTarget.match,
  run: (context) => {
    if (!selectCardEffectTarget.match(context.action)) return

    const state = context.state.duel
    const cardInstanceId = state.pendingPlayedCardId
    const { targetCardInstanceId } = context.action.payload
    const card = cardInstanceId ? state.cards[cardInstanceId] : undefined

    if (
      !cardInstanceId ||
      card?.baseId !== cardBaseId ||
      !canCardBeEffectTarget(state, targetCardInstanceId)
    ) {
      return
    }

    effect({ ...context, cardInstanceId, targetCardInstanceId })
    context.dispatch(resolvePendingPlayedCard({ cardInstanceId }))
  },
})
