import { DuelPhases } from '@/state'

type DuelPhase = (typeof DuelPhases)[keyof typeof DuelPhases]

export interface DuelState {
  phase: DuelPhase
}

export type StartInitialDrawAction = {
  type: 'START_INITIAL_DRAW'
}

export type DuelAction = StartInitialDrawAction
