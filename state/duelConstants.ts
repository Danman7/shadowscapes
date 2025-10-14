import { DuelState } from '@/types'

export const DuelPhases = {
  Intro: 'Intro',
  InitialDraw: 'InitialDraw',
  Redraw: 'Redraw',
  PlayerTurn: 'PlayerTurn',
} as const

export const initialDuelState: DuelState = {
  phase: DuelPhases.Intro,
}
