import {
  createCardInstance,
  type AttributeOverride,
} from 'src/game-engine/cards'
import {
  INITIAL_DUEL_STATE,
  PLACEHOLDER_PLAYER,
} from 'src/game-engine/constants'
import type {
  CardBaseId,
  CardInstance,
  Duel,
  DuelCards,
  DuelLog,
  DuelPlayerOrder,
  DuelPlayers,
  PendingCharacterAbility,
  PendingInstant,
  Phase,
  Player,
  PlayerId,
} from 'src/game-engine/types'

interface TestCardOptions {
  attributes?: AttributeOverride
  didAct?: boolean
}

interface TestDuelStateOptions {
  phase?: Phase
  cards?: DuelCards | CardInstance[]
  player1?: Partial<Player>
  player2?: Partial<Player>
  playerOrder?: DuelPlayerOrder
  logs?: DuelLog[]
  pendingInstant?: PendingInstant | null
  pendingCharacterAbility?: PendingCharacterAbility | null
}

const TEST_PLAYER_NAMES: Record<string, string> = {
  player1: 'Alice',
  player2: 'Bob',
}

export const makeTestCard = (
  baseId: CardBaseId,
  id: string,
  options: TestCardOptions = {},
): CardInstance => ({
  ...createCardInstance(baseId, id, options.attributes),
  didAct: options.didAct ?? false,
})

export const makeTestCards = (...cards: CardInstance[]): DuelCards =>
  Object.fromEntries(cards.map((card) => [card.id, card]))

export const makeTestPlayer = (
  id: PlayerId,
  overrides: Partial<Player> = {},
): Player => ({
  ...PLACEHOLDER_PLAYER,
  id,
  name: TEST_PLAYER_NAMES[id] ?? id,
  ...overrides,
})

const normalizeCards = (
  cards: DuelCards | CardInstance[] | undefined,
): DuelCards => {
  if (cards === undefined) return {}
  if (Array.isArray(cards)) return makeTestCards(...cards)
  return cards
}

export const makeTestDuelState = ({
  phase = INITIAL_DUEL_STATE.phase,
  cards,
  player1,
  player2,
  playerOrder = ['player1', 'player2'],
  logs = [],
  pendingInstant = null,
  pendingCharacterAbility = null,
}: TestDuelStateOptions = {}): Duel => {
  const players: DuelPlayers = {
    player1: makeTestPlayer('player1', player1),
    player2: makeTestPlayer('player2', player2),
  }

  return {
    ...INITIAL_DUEL_STATE,
    phase,
    cards: normalizeCards(cards),
    players,
    playerOrder,
    logs,
    pendingInstant,
    pendingCharacterAbility,
  }
}
