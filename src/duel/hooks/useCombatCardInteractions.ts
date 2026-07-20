import { useCallback, useEffect, useState } from 'react'

import { selectCardEffectTarget } from '../cardEffects/targetedCardEffect'
import { ATTACK_ANIMATION_DELAY_MS } from '../constants'
import { attackCharacter } from '../state'
import type { CardInstance, CardInstanceId } from '../types'
import {
  canCardBeEffectTarget,
  isCharacterInstance,
  isPlayerHumanControlled,
} from '../utils'
import { useDuelDispatch } from './useDuelDispatch'
import { useDuelState } from './useDuelState'

interface PendingAttack {
  attackerId: CardInstanceId
  defenderId: CardInstanceId
}

export const useCombatCardInteractions = () => {
  const dispatch = useDuelDispatch()
  const duelState = useDuelState()
  const { actPlayerId, cards, pendingPlayedCardId, phase, players } = duelState
  const [selectedAttackerId, setSelectedAttackerId] =
    useState<CardInstanceId | null>(null)
  const [pendingAttack, setPendingAttack] = useState<PendingAttack | null>(null)

  useEffect(() => {
    setSelectedAttackerId(null)
  }, [actPlayerId, phase])

  useEffect(() => {
    if (!pendingAttack) return

    const timeoutId = window.setTimeout(() => {
      dispatch(
        attackCharacter({
          attackerId: pendingAttack.attackerId,
          defenderId: pendingAttack.defenderId,
        }),
      )
      setPendingAttack(null)
      setSelectedAttackerId(null)
    }, ATTACK_ANIMATION_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [dispatch, pendingAttack])

  const getCardOnClick = useCallback(
    (card: CardInstance) => {
      if (phase === 'play') {
        const pendingCard = pendingPlayedCardId
          ? cards[pendingPlayedCardId]
          : undefined

        if (
          !pendingCard ||
          !isPlayerHumanControlled(duelState, pendingCard.ownerId)
        ) {
          return undefined
        }

        if (!canCardBeEffectTarget(duelState, card.id)) return undefined

        return () =>
          dispatch(selectCardEffectTarget({ targetCardInstanceId: card.id }))
      }

      if (card.stack !== 'board') return undefined
      if (phase !== 'act' || !actPlayerId || pendingAttack) return undefined
      if (!isPlayerHumanControlled(duelState, actPlayerId)) return undefined

      if (card.ownerId === actPlayerId) {
        const actingPlayer = players[actPlayerId]

        if (
          !isCharacterInstance(card) ||
          (card.traits.stunned ?? 0) > 0 ||
          card.didAct ||
          actingPlayer.hasActedThisPhase
        ) {
          return undefined
        }

        return () => setSelectedAttackerId(card.id)
      }

      if (!selectedAttackerId || !isCharacterInstance(card)) return undefined

      return () =>
        setPendingAttack({
          attackerId: selectedAttackerId,
          defenderId: card.id,
        })
    },
    [
      actPlayerId,
      cards,
      dispatch,
      duelState,
      pendingAttack,
      pendingPlayedCardId,
      phase,
      players,
      selectedAttackerId,
    ],
  )

  const getBoardCardClassName = useCallback(
    (card: CardInstance) => {
      if (pendingAttack?.attackerId !== card.id) return undefined

      return 'card-attack-up'
    },
    [pendingAttack],
  )

  const isCardSelected = useCallback(
    (card: CardInstance) =>
      card.id === selectedAttackerId ||
      (phase === 'play' && card.id === pendingPlayedCardId),
    [pendingPlayedCardId, phase, selectedAttackerId],
  )
  const clearSelection = useCallback(() => setSelectedAttackerId(null), [])

  return {
    clearSelection,
    getBoardCardClassName,
    getCardOnClick,
    isAttackPending: pendingAttack !== null,
    isCardSelected,
  }
}

export type CombatCardInteractions = ReturnType<
  typeof useCombatCardInteractions
>
