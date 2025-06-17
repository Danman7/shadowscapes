import type { AllCardNames, CardBase } from 'src/modules/cards/types'
import { User } from 'src/modules/user/types'

export type DuelCard = CardBase & { id: string; baseName: AllCardNames }

export type PlayerStack = 'deck' | 'hand' | 'board' | 'discard'

export type PlayerStacks = Record<PlayerStack, string[]>

export interface DuelPlayerProps {
  coins: number
  income: number
  hasPerformedAction: boolean
}

export interface DuelPlayer
  extends Omit<User, 'draftDeck'>,
    PlayerStacks,
    DuelPlayerProps {}

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

export type DuelPlayersAndCards = {
  players: DuelPlayers
  cards: DuelCards
}

export interface DuelState extends DuelPlayersAndCards {
  phase: DuelPhase
  activePlayerId: string
  inactivePlayerId: string
}

export type DuelStartingUsers = [User, User]

export type InitialiseDuelAction = {
  type: 'INITIALISE_DUEL'
  users: DuelStartingUsers
}

export type DuelAction = InitialiseDuelAction

export type PlayerStackSetup = {
  id: string
  name: string
} & Partial<Record<PlayerStack, AllCardNames[]>>
