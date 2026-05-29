import { useEffect, useRef, useState } from 'react'

import type { AttackAnimationRequest } from 'src/components/DuelView/attackAnimation'

const ATTACK_ANIMATION_MS = 350

export const useAttackAnimation = (): {
  attackingCardId: string | null
  requestAttackAnimation: (request: AttackAnimationRequest) => void
} => {
  const [attackingCardId, setAttackingCardId] = useState<string | null>(null)
  const attackAnimationTimeoutRef = useRef<number | null>(null)

  const requestAttackAnimation = ({
    attackerId,
  }: AttackAnimationRequest): void => {
    setAttackingCardId(attackerId)

    if (attackAnimationTimeoutRef.current !== null) {
      window.clearTimeout(attackAnimationTimeoutRef.current)
    }

    attackAnimationTimeoutRef.current = window.setTimeout(() => {
      setAttackingCardId(null)
      attackAnimationTimeoutRef.current = null
    }, ATTACK_ANIMATION_MS)
  }

  useEffect(() => {
    return () => {
      if (attackAnimationTimeoutRef.current !== null)
        window.clearTimeout(attackAnimationTimeoutRef.current)
    }
  }, [])

  return { attackingCardId, requestAttackAnimation }
}
