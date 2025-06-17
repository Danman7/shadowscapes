import { allCardBases } from 'src/modules/cards/bases'
import { AllCardNames } from 'src/modules/cards/types'
import { STARTING_COINS } from 'src/modules/duel/constants'
import { DuelCard, DuelStartingUsers, DuelState } from 'src/modules/duel/types'
import { generateId } from 'src/utils'

export const createDuelCardFromBase = (
  baseName: AllCardNames,
): [string, DuelCard] => {
  const id = generateId()
  const card = { ...allCardBases[baseName], baseName, id }
  return [id, card]
}

export const convertUsersToDuelPlayersAndCards = (
  users: DuelStartingUsers,
): [DuelState['cards'], DuelState['players']] => {
  const cards: DuelState['cards'] = {}
  const players: DuelState['players'] = {}

  users.forEach((user) => {
    const deckIds: string[] = user.draftDeck.map((cardName: AllCardNames) => {
      const [id, card] = createDuelCardFromBase(cardName)
      cards[id] = card

      return id
    })

    players[user.id] = {
      ...user,
      deck: deckIds,
      hand: [],
      board: [],
      discard: [],
      income: 0,
      coins: STARTING_COINS,
      hasPerformedAction: false,
    }
  })

  return [cards, players]
}

export const flipCoinForFirstPlayer = (
  users: DuelStartingUsers,
): [string, string] => {
  const coinFlip = Math.floor(Math.random() * 2)

  return [users[coinFlip].id, users[1 - coinFlip].id]
}

export const getBaseFromDuelCard = (duelCard: DuelCard) =>
  allCardBases[duelCard.baseName]
