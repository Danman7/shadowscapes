export type Faction = 'chaos' | 'order' | 'shadow' | 'neutral'
export type CardType = 'Character' | 'Instant'
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
  | 'Elemental'

export type CardBaseId =
  | 'zombie'
  | 'haunt'
  | 'cook'
  | 'novice'
  | 'elevatedAcolyte'
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
  | 'guardianStatue'
  | 'minesGuardian'

export interface CardText {
  description: string
  flavor: string
}

export interface CardAttributes {
  cost: number
  life?: number
  strength?: number
  nextAttackStrengthBonus?: number
  charges?: number
  stunnedTurnsRemaining?: number
  hasHaste?: boolean
  cannotAttack?: boolean
  retaliates?: boolean
  isHidden?: boolean
  isStunned?: boolean
}

export interface CardBase {
  id: CardBaseId
  name: string
  type: CardType
  faction: Faction
  categories: CardCategory[]
  isElite?: boolean
  text: CardText
  attributes: CardAttributes
}

export type CardInstanceId = string

export interface CardInstance {
  id: CardInstanceId
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
  deck: CardInstanceId[]
  hand: CardInstanceId[]
  board: CardInstanceId[]
  discard: CardInstanceId[]
}

export type Phase =
  | 'intro'
  | 'initial-draw'
  | 'redraw'
  | 'player-turn'
  | 'turn-end'

export type PendingInstant = 'SPEED_POTION' | 'FLASH_BOMB' | 'BOOK_OF_ASH'

export interface PendingCharacterAbility {
  sourceCardInstanceId: CardInstanceId
  sourceCardBaseId: CardBaseId
}

export interface PlayerSetup {
  id: PlayerId
  name: string
  deck: CardBaseId[]
}

export type DuelCards = Record<CardInstanceId, CardInstance>
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
  pendingCharacterAbility: PendingCharacterAbility | null
}
