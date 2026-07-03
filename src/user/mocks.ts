import type { CardBaseId } from '../cards'
import { EMPTY_PLAYER, INITIAL_PLAYER_COINS } from '../duel/constants'
import type {
  CardInstance,
  DuelPlayer,
  DuelState,
  PlayerId,
  Stack,
} from '../duel/types'
import { createCardInstance } from '../duel/utils'
import type { User } from './types'

export const mockOrderUser: User = {
  id: 'user1',
  name: 'Bafford',
  activeDeck: [
    'novice',
    'novice',
    'templeGuard',
    'templeGuard',
    'acolyte',
    'acolyte',
    'yoraSkull',
  ],
}

export const mockChaosUser: User = {
  id: 'user2',
  name: 'Constantine',
  activeDeck: ['zombie', 'zombie', 'haunt', 'haunt', 'bookOfAsh'],
}

type MockedStack = CardBaseId | readonly CardBaseId[]

export interface MockedDuelPlayerOptions {
  name?: string
  coins?: number
  income?: number
  hasActedThisPhase?: boolean
  deck?: MockedStack
  hand?: MockedStack
  board?: MockedStack
  discard?: MockedStack
}

export interface SetupMockedDuelOptions {
  activePlayer?: MockedDuelPlayerOptions
  inactivePlayer?: MockedDuelPlayerOptions
}

const normalizeStack = (stack?: MockedStack): readonly CardBaseId[] => {
  if (stack === undefined) return []

  return typeof stack === 'string' ? [stack] : stack
}

const createMockedPlayer = (
  id: PlayerId,
  defaultName: string,
  options: MockedDuelPlayerOptions,
  cards: Record<string, CardInstance>,
): DuelPlayer => {
  const player: DuelPlayer = {
    ...structuredClone(EMPTY_PLAYER),
    id,
    name: options.name ?? defaultName,
    coins: options.coins ?? INITIAL_PLAYER_COINS,
    income: options.income ?? 0,
    hasActedThisPhase: options.hasActedThisPhase ?? false,
  }

  const stacks: Stack[] = ['deck', 'hand', 'board', 'discard']

  stacks.forEach((stack) => {
    normalizeStack(options[stack]).forEach((baseId) => {
      const card = createCardInstance(baseId, id, stack)

      cards[card.id] = card
      player[stack].push(card.id)
    })
  })

  return player
}

export const setupMockedDuel = (
  options: SetupMockedDuelOptions = {},
): DuelState => {
  const cards: Record<string, CardInstance> = {}
  const activePlayer = createMockedPlayer(
    mockOrderUser.id,
    mockOrderUser.name,
    options.activePlayer ?? {},
    cards,
  )
  const inactivePlayer = createMockedPlayer(
    mockChaosUser.id,
    mockChaosUser.name,
    options.inactivePlayer ?? {},
    cards,
  )

  return {
    round: 0,
    phase: 'setup',
    playerOrder: [activePlayer.id, inactivePlayer.id],
    players: {
      [activePlayer.id]: activePlayer,
      [inactivePlayer.id]: inactivePlayer,
    },
    cards,
  }
}
