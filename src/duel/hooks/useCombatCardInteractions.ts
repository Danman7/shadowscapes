import { useCallback, useEffect, useState } from 'react'

import { ATTACK_ANIMATION_DELAY_MS } from '../constants'
import { attackCharacter } from '../state'
import type { CardInstance, CardInstanceId } from '../types'
import { isCharacterInstance } from '../utils'
import { useDuelDispatch } from './useDuelDispatch'
import { useDuelState } from './useDuelState'

interface PendingAttack {
  attackerId: CardInstanceId
  defenderId: CardInstanceId
}

export const useCombatCardInteractions = () => {
  const dispatch = useDuelDispatch()
  const { actPlayerId, phase, players } = useDuelState()
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

  const getBoardCardOnClick = useCallback(
    (card: CardInstance) => {
      if (phase !== 'act' || !actPlayerId || pendingAttack) return undefined

      if (card.ownerId === actPlayerId) {
        const actingPlayer = players[actPlayerId]

        if (
          !isCharacterInstance(card) ||
          card.turnsStunned > 0 ||
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
      pendingAttack,
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
    (card: CardInstance) => card.id === selectedAttackerId,
    [selectedAttackerId],
  )
  const clearSelection = useCallback(() => setSelectedAttackerId(null), [])

  return {
    clearSelection,
    getBoardCardClassName,
    getBoardCardOnClick,
    isAttackPending: pendingAttack !== null,
    isCardSelected,
  }
}

export type CombatCardInteractions = ReturnType<
  typeof useCombatCardInteractions
>
