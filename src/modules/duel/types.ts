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
  | 'Intro Screen'
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
  logs: string[]
}

export type DuelStartingUsers = [User, User]

export type InitialiseDuelAction = {
  type: 'INITIALISE_DUEL'
  users: DuelStartingUsers
}

export type ProgressToInitialDrawAction = {
  type: 'PROGRESS_TO_INITIAL_DRAW'
}

export type DrawInitialCardsAction = {
  type: 'DRAW_INITIAL_CARDS'
}

export type ProgressToRedrawAction = {
  type: 'PROGRESS_TO_REDRAW'
}

export type RedrawCard = {
  type: 'REDRAW_CARD'
  playerId: string
  cardId: string
}

export type DrawACardAction = {
  type: 'DRAW_A_CARD'
  playerId: string
}

export type ReadyWithRedrawAction = {
  type: 'READY_WITH_REDRAW'
  playerId: string
}

export type SkipRedrawAction = {
  type: 'SKIP_REDRAW'
  playerId: string
}

export type BeginFirstTurn = {
  type: 'BEGIN_FIRST_TURN'
}

export type DuelAction =
  | InitialiseDuelAction
  | ProgressToInitialDrawAction
  | DrawInitialCardsAction
  | ProgressToRedrawAction
  | RedrawCard
  | DrawACardAction
  | ReadyWithRedrawAction
  | SkipRedrawAction
  | BeginFirstTurn

export type PlayerStackSetup = {
  id: string
  name: string
} & Partial<Record<PlayerStack, AllCardNames[]>>
