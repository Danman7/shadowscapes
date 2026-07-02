import { CardBaseId } from '../cards'

export type PlayerId = string
export type CardInstanceId = string

export const stacks = ['deck', 'hand', 'board', 'discard'] as const

export type Stack = (typeof stacks)[number]

export const phases = ['setup', 'draw', 'play', 'act', 'refresh'] as const

export type Phase = (typeof phases)[number]

export interface CardInstance {
  id: CardInstanceId
  baseId: CardBaseId
  ownerId: PlayerId
  stack: Stack
}

export interface DuelPlayer {
  id: PlayerId
  name: string
  coins: number
  income: number
  deck: CardInstanceId[]
  hand: CardInstanceId[]
  board: CardInstanceId[]
  discard: CardInstanceId[]
  hasActedThisPhase: boolean
}

export interface DuelState {
  round: number
  phase: Phase
  playerOrder: [PlayerId, PlayerId]
  players: Record<PlayerId, DuelPlayer>
  cards: Record<CardInstanceId, CardInstance>
}
