import type { UnknownAction } from '@reduxjs/toolkit'
import { useEffect } from 'react'

import { selectCardEffectTarget } from '../cardEffects'
import { AUTOMATED_ACTION_DELAY_MS } from '../constants'
import {
  attackCharacter,
  passActTurn,
  passPlayTurn,
  playCard,
} from '../state'
import type { DuelState } from '../types'
import {
  canActPlayerPass,
  getRandomAiAttackPairs,
  getRandomAiEffectTargetIds,
  getRandomAiPlayableCardIds,
  isAwaitingCardEffectTarget,
  isPlayerAiControlled,
  selectRandomItem,
  shouldRandomAiPassPlayTurn,
} from '../utils'
import { useDuelDispatch } from './useDuelDispatch'
import { useDuelState } from './useDuelState'

const getRandomAiAction = (state: DuelState): UnknownAction | null => {
  if (state.phase === 'play') {
    const activePlayerId = state.playerOrder[0]
    const activePlayer = state.players[activePlayerId]

    if (!isPlayerAiControlled(state, activePlayerId) || !activePlayer) {
      return null
    }

    if (isAwaitingCardEffectTarget(state)) {
      const pendingCard = state.pendingPlayedCardId
        ? state.cards[state.pendingPlayedCardId]
        : undefined

      if (!pendingCard || !isPlayerAiControlled(state, pendingCard.ownerId)) {
        return null
      }

      const targetCardInstanceId = selectRandomItem(
        getRandomAiEffectTargetIds(state),
      )

      return targetCardInstanceId
        ? selectCardEffectTarget({ targetCardInstanceId })
        : null
    }

    if (activePlayer.hasActedThisPhase || state.pendingPlayedCardId) {
      return null
    }

    if (shouldRandomAiPassPlayTurn(state, activePlayerId)) {
      return passPlayTurn()
    }

    const cardInstanceId = selectRandomItem(
      getRandomAiPlayableCardIds(state, activePlayerId),
    )
    const card = cardInstanceId ? state.cards[cardInstanceId] : undefined

    if (!cardInstanceId || !card) return passPlayTurn()

    return playCard({
      playerId: activePlayerId,
      cardInstanceId,
      cardBaseId: card.baseId,
    })
  }

  if (state.phase === 'act') {
    const actPlayerId = state.actPlayerId

    if (!actPlayerId || !isPlayerAiControlled(state, actPlayerId)) {
      return null
    }

    const attackPair = selectRandomItem(
      getRandomAiAttackPairs(state, actPlayerId),
    )

    if (attackPair) return attackCharacter(attackPair)
    if (canActPlayerPass(state)) return passActTurn()
  }

  return null
}

export const useRandomAiController = () => {
  const dispatch = useDuelDispatch()
  const duelState = useDuelState()

  useEffect(() => {
    const action = getRandomAiAction(duelState)

    if (!action) return

    const timeoutId = window.setTimeout(() => {
      dispatch(action)
    }, AUTOMATED_ACTION_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [dispatch, duelState])
}
