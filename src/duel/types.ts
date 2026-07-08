import { CardBaseId } from '../cards'

export type PlayerId = string
export type CardInstanceId = string

export const stacks = ['deck', 'hand', 'board', 'discard'] as const

export type Stack = (typeof stacks)[number]

export const phases = ['setup', 'draw', 'play', 'act', 'refresh'] as const

export type Phase = (typeof phases)[number]

export type DuelMode =
  | { type: 'hot-seat' }
  | {
      type: 'solo-random-ai'
      humanPlayerId: PlayerId
      aiPlayerId: PlayerId
    }

interface SharedCardInstance {
  id: CardInstanceId
  baseId: CardBaseId
  ownerId: PlayerId
  stack: Stack
  cost: number
}

export interface InstanceCardInstance extends SharedCardInstance {
  type: 'instance'
}

export interface CharacterCardInstance extends SharedCardInstance {
  type: 'character'
  life: number
  strength: number
  charges?: number
  turnsStunned: number
  didAct: boolean
}

export type CardInstance = InstanceCardInstance | CharacterCardInstance

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
  mode: DuelMode
  playerOrder: [PlayerId, PlayerId]
  players: Record<PlayerId, DuelPlayer>
  cards: Record<CardInstanceId, CardInstance>
  pendingPlayedCardId: CardInstanceId | null
  actPlayerId: PlayerId | null
}
