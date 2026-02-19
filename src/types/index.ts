export type Faction = 'chaos' | 'order' | 'shadow' | 'neutral'
export type CardType = 'character' | 'instant'
export type CardCategory =
  | 'Undead'
  | 'Hammerite'
  | 'Guard'
  | 'Servant'
  | 'Artifact'
  | 'Thief'
  | 'Necromancer'
  | 'Priest'
  | 'Beast'

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
  | 'highPriestMarkander'
  | 'burrick'
  | 'mysticsSoul'
  | 'priest'

export type CardRank = 'common' | 'elite'

interface CardBaseCommon {
  id: CardBaseId
  name: string
  cost: number
  description: string[]
  flavorText: string
  faction: Faction
  categories: CardCategory[]
  rank: CardRank
  charges?: number
}

export interface CardBaseCharacter extends CardBaseCommon {
  type: 'character'
  life: number
  strength: number
}

export interface CardBaseInstant extends CardBaseCommon {
  type: 'instant'
}

export type CardBase = CardBaseCharacter | CardBaseInstant

export interface CardInstance {
  id: number
  baseId: CardBaseId
  cost: number
  life?: number
  strength?: number
  charges?: number
  didAct?: boolean
}

export type PlayerId = 'player1' | 'player2'
export type Stack = 'hand' | 'board' | 'deck' | 'discard'

export interface Player {
  id: PlayerId
  name: string
  coins: number
  playerReady: boolean
  deck: number[]
  hand: number[]
  board: number[]
  discard: number[]
}

export type Phase =
  | 'intro'
  | 'initial-draw'
  | 'redraw'
  | 'player-turn'
  | 'turn-end'

export interface Duel {
  cards: Record<number, CardInstance>
  players: { player1: Player; player2: Player }
  activePlayerId: PlayerId
  inactivePlayerId: PlayerId
  phase: Phase
  startingPlayerId: PlayerId | null
  logs: string[]
}

export type DuelAction =
  | {
      type: 'START_DUEL'
      payload: {
        player1Name: string
        player1Deck: CardBaseId[]
        player2Name: string
        player2Deck: CardBaseId[]
      }
    }
  | { type: 'TRANSITION_PHASE'; payload: Phase }
  | { type: 'INITIAL_DRAW' }
  | {
      type: 'PLAY_CARD'
      payload: { playerId: PlayerId; cardInstanceId: number }
    }
  | { type: 'SWITCH_TURN' }
  | {
      type: 'REDRAW_CARD'
      payload: { playerId: PlayerId; cardInstanceId: number }
    }
  | { type: 'SKIP_REDRAW'; payload: { playerId: PlayerId } }
  | {
      type: 'ATTACK_CARD'
      payload: {
        attackerId: number
        defenderId: number
      }
    }
  | {
      type: 'ATTACK_PLAYER'
      payload: {
        attackerId: number
      }
    }
