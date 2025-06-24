import { allCardBases } from 'src/modules/cards/bases'
import { AllCardNames } from 'src/modules/cards/types'
import {
  PLAYER_STACKS,
  STARTING_DUEL_PLAYER_PROPS,
} from 'src/modules/duel/constants'
import {
  DuelCard,
  DuelPlayer,
  DuelPlayersAndCards,
  DuelStartingUsers,
  DuelState,
  PlayerStack,
  PlayerStacks,
  PlayerStackSetup,
} from 'src/modules/duel/types'
import { generateId } from 'src/utils'

export const createDuelCardFromBase = (
  baseName: AllCardNames,
): { id: string; card: DuelCard } => {
  const id = generateId()
  const card = { ...allCardBases[baseName], baseName, id }
  return { id, card }
}

export const getBaseFromDuelCard = (duelCard: DuelCard) =>
  allCardBases[duelCard.baseName]

export const flipCoinForFirstPlayer = (
  users: DuelStartingUsers,
): { activePlayerId: string; inactivePlayerId: string } => {
  const coinFlip = Math.floor(Math.random() * 2)

  return {
    activePlayerId: users[coinFlip].id,
    inactivePlayerId: users[1 - coinFlip].id,
  }
}

export const convertUsersToDuelPlayersAndCards = (
  users: DuelStartingUsers,
): DuelPlayersAndCards => {
  const cards: DuelState['cards'] = {}
  const players: DuelState['players'] = {}

  users.forEach((user) => {
    const deckIds: string[] = user.draftDeck.map((cardName: AllCardNames) => {
      const { id, card } = createDuelCardFromBase(cardName)
      cards[id] = card

      return id
    })

    players[user.id] = {
      ...user,
      ...STARTING_DUEL_PLAYER_PROPS,
      deck: deckIds,
      hand: [],
      board: [],
      discard: [],
    }
  })

  return { cards, players }
}

export const setupPlayersAndCardsForTest = (
  playersSetup: PlayerStackSetup[],
): DuelPlayersAndCards => {
  const cards: DuelState['cards'] = {}
  const players: DuelState['players'] = {}

  playersSetup.forEach((playerSetup) => {
    const stackIds: PlayerStacks = {
      deck: [],
      hand: [],
      board: [],
      discard: [],
    }

    PLAYER_STACKS.forEach((stack) => {
      const cardNames = playerSetup[stack] || []
      stackIds[stack] = cardNames.map((cardName) => {
        const id = generateId()
        cards[id] = {
          ...allCardBases[cardName],
          id,
          baseName: cardName,
        }
        return id
      })
    })

    players[playerSetup.id] = {
      ...STARTING_DUEL_PLAYER_PROPS,
      id: playerSetup.id,
      name: playerSetup.name,
      ...stackIds,
    } as DuelPlayer
  })

  return { cards, players }
}

export const findPlayerAndStackFromId = (
  cardId: string,
  players: DuelState['players'],
): { stack: PlayerStack; player: DuelPlayer } => {
  for (const player of Object.values(players)) {
    for (const stack of PLAYER_STACKS) {
      if (player[stack].includes(cardId)) {
        return { stack, player }
      }
    }
  }

  throw new Error(`Card with id "${cardId}" not found in any player's stacks.`)
}

export const sortUserIdsForDuel = (
  userIds: [string, string],
  userId: string,
): [string, string] => {
  const userPlayerId = userIds.includes(userId)

  if (userPlayerId) {
    return userIds[0] === userId
      ? [userIds[1], userIds[0]]
      : [userIds[0], userIds[1]]
  }

  return userIds
}
