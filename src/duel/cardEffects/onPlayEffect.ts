import type { UnknownAction } from '@reduxjs/toolkit'

import type { CardBaseId } from '../../cards'
import {
  playCard,
  summonAllCopies,
  summonCard,
} from '../state/duelSlice'
import type { CardInstanceId, DuelState, PlayerId } from '../types'
import type {
  ActionEffectContext,
  ActionEffectRegistration,
} from './actionEffectsMiddleware'

export interface CardEffectsState {
  duel: DuelState
}

export interface OnPlayEffectContext
  extends ActionEffectContext<CardEffectsState> {
  cardInstanceId: CardInstanceId
  playerId: PlayerId
}

type OnPlayEffect = (context: OnPlayEffectContext) => void

const isBoardEntryAction = (action: UnknownAction) =>
  playCard.match(action) ||
  summonCard.match(action) ||
  summonAllCopies.match(action)

export const getNewBoardCardIds = (
  context: ActionEffectContext<CardEffectsState>,
): CardInstanceId[] => {
  const action = context.action

  if (!isBoardEntryAction(action)) return []

  const playerId = action.payload.playerId
  const previousPlayer = context.previousState.duel.players[playerId]
  const player = context.state.duel.players[playerId]

  if (!player) return []

  const previousBoard = new Set(previousPlayer?.board ?? [])
  const newCardIds = player.board.filter((cardId) => !previousBoard.has(cardId))

  if (summonAllCopies.match(action)) return newCardIds

  return newCardIds.filter(
    (cardId) => cardId === action.payload.cardInstanceId,
  )
}

export const createOnPlayCardEffect = (
  cardBaseId: CardBaseId,
  effect: OnPlayEffect,
): ActionEffectRegistration<CardEffectsState> => ({
  matches: isBoardEntryAction,
  run: (context) => {
    const action = context.action

    if (!isBoardEntryAction(action)) return

    const playerId = action.payload.playerId
    const cardIds = getNewBoardCardIds(context)

    cardIds.forEach((cardInstanceId) => {
      const card = context.state.duel.cards[cardInstanceId]

      if (card?.baseId !== cardBaseId) return

      effect({ ...context, cardInstanceId, playerId })
    })
  },
})
