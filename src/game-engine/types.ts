export type Faction = 'chaos' | 'order' | 'shadow' | 'neutral'
export type CardType = 'character' | 'instant'
export type CardRank = 'common' | 'elite'
export type CardCategory =
  | 'Undead'
  | 'Hammerite'
  | 'Guard'
  | 'Household'
  | 'Artifact'
  | 'Thief'
  | 'Necromancer'
  | 'Priest'
  | 'High'
  | 'Brother'
  | 'Beast'
  | 'Equipment'

export type CardBaseId =
  | 'zombie'
  | 'haunt'
  | 'cook'
  | 'novice'
  | 'templeGuard'
  | 'sachelman'
  | 'yoraSkull'
  | 'bookOfAsh'
  | 'downwinder'
  | 'markander'
  | 'burrick'
  | 'mysticsSoul'
  | 'speedPotion'
  | 'flashBomb'

export interface CardText {
  description: string[]
  flavor: string
}

export interface CardAttributes {
  cost: number
  life?: number
  strength?: number
  charges?: number
  haste?: boolean
  hidden?: boolean
  stunned?: boolean
}

export interface CardBase {
  id: CardBaseId
  name: string
  type: CardType
  faction: Faction
  categories: CardCategory[]
  rank: CardRank
  text: CardText
  attributes: CardAttributes
}

export interface CardInstance {
  id: string
  base: CardBase
  attributes: CardAttributes
  didAct?: boolean
}

export type PlayerId = string
export type Stack = 'hand' | 'board' | 'deck' | 'discard'

export interface Player {
  id: PlayerId
  name: string
  coins: number
  playerReady: boolean
  deck: string[]
  hand: string[]
  board: string[]
  discard: string[]
}

export type Phase =
  | 'intro'
  | 'initial-draw'
  | 'redraw'
  | 'player-turn'
  | 'turn-end'

export type PendingInstant = 'SPEED_POTION' | 'FLASH_BOMB'

export interface PlayerSetup {
  id: PlayerId
  name: string
  deck: CardBaseId[]
}

export type DuelCards = Record<string, CardInstance>
export type DuelPlayers = Record<PlayerId, Player>
export type DuelPlayerOrder = [PlayerId, PlayerId]
export type DuelLog = string

export interface Duel {
  cards: DuelCards
  players: DuelPlayers
  playerOrder: DuelPlayerOrder
  phase: Phase
  logs: DuelLog[]
  pendingInstant: PendingInstant | null
}

export type DuelAction =
  | {
      type: 'START_DUEL'
      payload: {
        players: [PlayerSetup, PlayerSetup]
      }
    }
  | { type: 'START_INITIAL_DRAW' }
  | { type: 'GO_TO_REDRAW' }
  | { type: 'START_FIRST_PLAYER_TURN' }
  | { type: 'GO_TO_END_OF_TURN' }
  | {
      type: 'PLAY_CARD'
      payload: { playerId: PlayerId; cardInstanceId: string }
    }
  | { type: 'SWITCH_TURN' }
  | {
      type: 'REDRAW_CARD'
      payload: { playerId: PlayerId; cardInstanceId: string }
    }
  | { type: 'SKIP_REDRAW'; payload: { playerId: PlayerId } }
  | {
      type: 'ATTACK_CARD'
      payload: {
        attackerId: string
        defenderId: string
      }
    }
  | {
      type: 'ATTACK_PLAYER'
      payload: {
        attackerId: string
      }
    }
  | {
      type: 'SET_PENDING_INSTANT'
      payload: { pendingInstant: PendingInstant | null }
    }
  | {
      type: 'APPLY_SPEED_POTION'
      payload: { targetCardInstanceId: string }
    }
  | {
      type: 'APPLY_FLASH_BOMB'
      payload: { targetCardInstanceId: string }
    }
