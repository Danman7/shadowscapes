export interface AttackAnimationRequest {
  attackerId: string
}

export const createAttackAnimationRequest = (
  attackerId: string,
): AttackAnimationRequest => ({ attackerId })
