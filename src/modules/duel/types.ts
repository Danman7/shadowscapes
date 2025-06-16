import type { AllCardNames, CardBase } from 'src/modules/cards/types'
import { User } from 'src/modules/user/types'

export type DuelCard = CardBase & { id: string; baseName: AllCardNames }

export interface PlayerStacks {
  deck: string[]
  hand: string[]
  board: string[]
  discard: string[]
}

export interface DuelPlayer extends Omit<User, 'draftDeck'>, PlayerStacks {
  coins: number
  income: number
  hasPerformedAction: boolean
}

export type DuelPhase =
  | 'Pre-duel'
  | 'Initial Draw'
  | 'Redrawing'
  | 'Player Turn'
  | 'Select Target'
  | 'Resolving turn'
  | 'Duel End'

export interface DuelPlayers {
  [id: string]: DuelPlayer
}

export type DuelCards = { [id: string]: DuelCard }

export interface DuelState {
  phase: DuelPhase
  players: DuelPlayers
  activePlayerId: string
  inactivePlayerId: string
  cards: DuelCards
}

export type DuelStartingUsers = [User, User]

export type InitialiseDuelAction = {
  type: 'INITIALISE_DUEL'
  users: DuelStartingUsers
}

export type DuelAction = InitialiseDuelAction
