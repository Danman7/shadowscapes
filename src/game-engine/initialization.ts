import type { Duel, Player, CardInstance, CardBaseId, PlayerId } from '@/types'
import {
  createCardInstance,
  shuffle,
  coinFlip,
  resetInstanceIdCounter,
} from '@/game-engine/utils'

/**
 * Creates an initial placeholder duel state (not yet started)
 */
export function createInitialDuel(): Duel {
  const placeholderPlayer: Player = {
    id: 'player1',
    name: '',
    coins: 0,
    deckIds: [],
    handIds: [],
    boardIds: [],
    discardIds: [],
  }

  return {
    cards: {},
    players: {
      player1: placeholderPlayer,
      player2: { ...placeholderPlayer, id: 'player2' },
    },
    activePlayerId: 'player1',
    inactivePlayerId: 'player2',
    phase: 'intro',
    startingPlayerId: null, // null indicates duel not yet started
  }
}

interface CreateDuelParams {
  player1Name: string
  player2Name: string
  player1Deck: CardBaseId[]
  player2Deck: CardBaseId[]
}

/**
 * Creates a new duel with two players
 * - Shuffles both decks
 * - Creates card instances from base IDs
 * - Performs coin flip to determine starting player
 * - Sets initial phase to 'intro'
 */
export function createDuel({
  player1Name,
  player2Name,
  player1Deck,
  player2Deck,
}: CreateDuelParams): Duel {
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

  return {
    cards: allCards,
    players: { player1, player2 },
    activePlayerId,
    inactivePlayerId,
    phase: 'intro',
    startingPlayerId,
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
