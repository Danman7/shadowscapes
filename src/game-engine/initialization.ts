import {
  coinFlip,
  createCardInstance,
  resetInstanceIdCounter,
  shuffle,
} from '@/game-engine/utils'
import type {
  CardBaseId,
  CardInstance,
  Duel,
  Player,
  PlayerId,
  Stack,
} from '@/types'

export interface CreateDuelParams {
  player1Name: string
  player2Name: string
  player1Deck: CardBaseId[]
  player2Deck: CardBaseId[]
}

export interface CreateDuelOverrides extends Partial<Duel> {
  stackOverrides?: Partial<
    Record<PlayerId, Partial<Record<Stack, CardBaseId[]>>>
  >
}

function getNextCardId(duel: Duel): number {
  const ids = Object.keys(duel.cards).map((id) => Number(id))
  if (ids.length === 0) {
    return 1
  }

  return Math.max(...ids) + 1
}

function buildStackIds(baseIds: CardBaseId[] | undefined, startId: number) {
  if (!baseIds) {
    return { ids: undefined, cards: [], nextId: startId }
  }

  let idCounter = startId
  const cards = baseIds.map((baseId) => createCardInstance(baseId, idCounter++))
  return {
    ids: cards.map((card) => card.id),
    cards,
    nextId: idCounter,
  }
}

function applyStackOverrides(
  duel: Duel,
  stackOverrides: CreateDuelOverrides['stackOverrides'],
): Duel {
  if (!stackOverrides) {
    return duel
  }

  let nextId = getNextCardId(duel)
  const newCards: Duel['cards'] = { ...duel.cards }
  const players = { ...duel.players }

  ;(['player1', 'player2'] as const).forEach((playerId) => {
    const overrides = stackOverrides[playerId]
    if (!overrides) {
      return
    }

    const basePlayer = players[playerId]
    const hand = buildStackIds(overrides.hand, nextId)
    nextId = hand.nextId

    const board = buildStackIds(overrides.board, nextId)
    nextId = board.nextId

    const discard = buildStackIds(overrides.discard, nextId)
    nextId = discard.nextId

    const deck = buildStackIds(overrides.deck, nextId)
    nextId = deck.nextId

    const stackResults = { hand, board, discard, deck }

    Object.values(stackResults).forEach((result) => {
      result.cards.forEach((card) => {
        newCards[card.id] = card
      })
    })

    players[playerId] = {
      ...basePlayer,
      handIds: stackResults.hand.ids ?? basePlayer.handIds,
      boardIds: stackResults.board.ids ?? basePlayer.boardIds,
      discardIds: stackResults.discard.ids ?? basePlayer.discardIds,
      deckIds: stackResults.deck.ids ?? basePlayer.deckIds,
    }
  })

  return {
    ...duel,
    cards: newCards,
    players,
  }
}

export function createDuel(
  { player1Name, player2Name, player1Deck, player2Deck }: CreateDuelParams,
  overrides: CreateDuelOverrides = {},
): Duel {
  resetInstanceIdCounter()

  const shuffledDeck1 = shuffle(player1Deck)
  const shuffledDeck2 = shuffle(player2Deck)

  const allCards: Record<number, CardInstance> = {}

  const player1DeckIds = shuffledDeck1.map((baseId) => {
    const instance = createCardInstance(baseId)
    allCards[instance.id] = instance
    return instance.id
  })

  const player2DeckIds = shuffledDeck2.map((baseId) => {
    const instance = createCardInstance(baseId)
    allCards[instance.id] = instance
    return instance.id
  })

  const player1: Player = {
    id: 'player1',
    name: player1Name,
    coins: 0,
    deckIds: player1DeckIds,
    handIds: [],
    boardIds: [],
    discardIds: [],
  }

  const player2: Player = {
    id: 'player2',
    name: player2Name,
    coins: 0,
    deckIds: player2DeckIds,
    handIds: [],
    boardIds: [],
    discardIds: [],
  }

  const player1Starts = coinFlip()
  const startingPlayerId = player1Starts ? 'player1' : 'player2'
  const activePlayerId = startingPlayerId
  const inactivePlayerId = player1Starts ? 'player2' : 'player1'

  let duel: Duel = {
    cards: allCards,
    players: { player1, player2 },
    activePlayerId,
    inactivePlayerId,
    phase: 'intro',
    startingPlayerId,
  }

  const { stackOverrides, cards, players, ...restOverrides } = overrides

  duel = applyStackOverrides(duel, stackOverrides)

  const mergedCards = cards ?? duel.cards
  const mergedPlayers = players
    ? {
        player1: { ...duel.players.player1, ...(players.player1 ?? {}) },
        player2: { ...duel.players.player2, ...(players.player2 ?? {}) },
      }
    : duel.players

  return {
    ...duel,
    ...restOverrides,
    cards: mergedCards,
    players: mergedPlayers,
  }
}

/**
 * Gets a player by ID from the duel
 */
export function getPlayer(duel: Duel, playerId: PlayerId): Player {
  return duel.players[playerId]
}

/**
 * Updates a player in the duel
 */
export function updatePlayer(
  duel: Duel,
  playerId: PlayerId,
  updates: Partial<Player>,
): Duel {
  return {
    ...duel,
    players: {
      ...duel.players,
      [playerId]: { ...duel.players[playerId], ...updates },
    },
  }
}

export const drawTopCard = (
  duel: Readonly<Duel>,
  playerId: 'player1' | 'player2',
): Readonly<Duel> => {
  const player = getPlayer(duel, playerId)

  if (player.deckIds.length === 0) {
    return duel
  }

  const [drawnCardId, ...remainingDeckIds] = player.deckIds

  if (drawnCardId == null) return duel

  return updatePlayer(duel, playerId, {
    deckIds: remainingDeckIds,
    handIds: [...player.handIds, drawnCardId],
  })
}
