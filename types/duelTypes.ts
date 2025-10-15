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

export interface Player {
  id: DuelPlayerId
  name: string
  coins: number
  userId: string
  hasPerformedAction: boolean
}

export interface DuelState {
  phase: DuelPhase
  cards: Record<string, CardInstance>
  players: Record<DuelPlayerId, Player>
  zones: Record<ZoneKey, string[]>
  cardZone: Record<string, ZoneKey>
  activePlayerId: DuelPlayerId
}

export type DuelReadyUser = {
  id: string
  name: string
  deck: CardDefinitionId[]
}

export type StartInitialDrawAction = {
  type: 'START_INITIAL_DRAW'
}

export type StartDuelAction = {
  type: 'START_DUEL'
  players: [DuelReadyUser, DuelReadyUser]
}

export type flipCoinForFirstPlayer = {
  type: 'FLIP_COIN_FOR_FIRST_PLAYER'
}

export type DuelAction =
  | StartInitialDrawAction
  | StartDuelAction
  | flipCoinForFirstPlayer

export type UpdatePlayerProps = Partial<Omit<Player, 'id'>>
