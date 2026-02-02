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
    Record<PlayerId, Partial<Record<Stack, CardBaseId | CardBaseId[]>>>
  >
}

function getNextCardId(duel: Duel): number {
  const ids = Object.keys(duel.cards).map((id) => Number(id))
  if (ids.length === 0) {
    return 1
  }

  return Math.max(...ids) + 1
}

function buildStackIds(
  baseIds: CardBaseId | CardBaseId[] | undefined,
  startId: number,
) {
  if (!baseIds) {
    return { ids: undefined, cards: [], nextId: startId }
  }

  const idsArray = Array.isArray(baseIds) ? baseIds : [baseIds]
  let idCounter = startId
  const cards = idsArray.map((baseId) =>
    createCardInstance(baseId, idCounter++),
  )
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
      hand: stackResults.hand.ids ?? basePlayer.hand,
      board: stackResults.board.ids ?? basePlayer.board,
      discard: stackResults.discard.ids ?? basePlayer.discard,
      deck: stackResults.deck.ids ?? basePlayer.deck,
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

  const player1deck = shuffledDeck1.map((baseId) => {
    const instance = createCardInstance(baseId)
    allCards[instance.id] = instance
    return instance.id
  })

  const player2deck = shuffledDeck2.map((baseId) => {
    const instance = createCardInstance(baseId)
    allCards[instance.id] = instance
    return instance.id
  })

  const player1: Player = {
    id: 'player1',
    name: player1Name,
    coins: 0,
    deck: player1deck,
    hand: [],
    board: [],
    discard: [],
  }

  const player2: Player = {
    id: 'player2',
    name: player2Name,
    coins: 0,
    deck: player2deck,
    hand: [],
    board: [],
    discard: [],
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

export const getPlayer = (duel: Duel, playerId: PlayerId): Player =>
  duel.players[playerId]

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

  if (player.deck.length === 0) {
    return duel
  }

  const [drawnCardId, ...remainingdeck] = player.deck

  if (drawnCardId == null) return duel

  return updatePlayer(duel, playerId, {
    deck: remainingdeck,
    hand: [...player.hand, drawnCardId],
  })
}
