import { CardZones, DuelPhases } from '@/state'
import { CardDefinitionId } from '@/types/cardTypes'

type DuelPhase = (typeof DuelPhases)[keyof typeof DuelPhases]

export type DuelPlayerId = 'Player1' | 'Player2'

export type CardZone = (typeof CardZones)[keyof typeof CardZones]
export type ZoneKey = `${DuelPlayerId}:${CardZone}`

export interface CardInstance {
  id: string
  definitionId: CardDefinitionId
  ownerId: DuelPlayerId
}

interface Player {
  id: DuelPlayerId
  name: string
  coins: number
}

export interface DuelState {
  phase: DuelPhase
  cards: Record<string, CardInstance>
  players: Record<DuelPlayerId, Player>
  zones: Record<ZoneKey, string[]>
  cardZone: Record<string, ZoneKey>
  activePlayerId: DuelPlayerId
}

export type StartInitialDrawAction = {
  type: 'START_INITIAL_DRAW'
}

export type DuelAction = StartInitialDrawAction
