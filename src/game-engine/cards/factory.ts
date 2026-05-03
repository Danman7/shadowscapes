import {
  CARD_BASES,
  INITIAL_DUEL_STATE,
  PLACEHOLDER_PLAYER,
} from 'src/game-engine/constants'
import { getOpponentId } from 'src/game-engine/utils/gameQueries'
import type {
  CardBaseId,
  Duel,
  DuelCards,
  DuelPlayers,
  PlayerSetup,
} from 'src/game-engine/types'
import { formatString, messages } from 'src/i18n'

import { createCardInstance } from 'src/game-engine/cards/instances'

export type CreateDuelParams = [PlayerSetup, PlayerSetup]

const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array]

  for (let index = shuffled.length - 1; index > 0; index--) {
    const shuffledIndex = Math.floor(Math.random() * (index + 1))
    const selectedCard = shuffled[index]!
    shuffled[index] = shuffled[shuffledIndex]!
    shuffled[shuffledIndex] = selectedCard
  }

  return shuffled
}

const getDeckSummaryLog = (playerName: string, cards: CardBaseId[]): string => {
  const eliteCount = cards.filter(
    (baseId) => CARD_BASES[baseId].isElite === true,
  ).length
  const totalCost = cards.reduce(
    (sum, baseId) => sum + CARD_BASES[baseId].attributes.cost,
    0,
  )
  const cardCount = cards.length

  return formatString(messages.reducer.deckSummary, {
    playerName,
    cardCount,
    eliteCount,
    totalCost,
  })
}

export const createDuel = (playerSetups: CreateDuelParams): Duel => {
  const allCards: DuelCards = {}
  const players: DuelPlayers = {}

  for (const playerSetup of playerSetups) {
    const shuffledDeck = shuffle(playerSetup.deck)
    const deckIds = shuffledDeck.map((baseId) => {
      const instance = createCardInstance(baseId)
      allCards[instance.id] = instance
      return instance.id
    })

    players[playerSetup.id] = {
      ...PLACEHOLDER_PLAYER,
      id: playerSetup.id,
      name: playerSetup.name,
      deck: deckIds,
    }
  }

  const [player1, player2] = playerSetups
  const startingPlayerId = Math.random() < 0.5 ? player1.id : player2.id
  const inactivePlayerId = getOpponentId(
    [player1.id, player2.id],
    startingPlayerId,
  )

  return {
    ...INITIAL_DUEL_STATE,
    cards: allCards,
    players,
    playerOrder: [startingPlayerId, inactivePlayerId],
    logs: playerSetups.map((player) =>
      getDeckSummaryLog(player.name, player.deck),
    ),
  }
}
