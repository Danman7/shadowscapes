import { CARD_BASES } from 'src/constants/cardBases'
import { PLACEHOLDER_PLAYER } from 'src/constants/duelParams'
import type {
  CardBase,
  CardBaseCharacter,
  CardBaseId,
  CardInstance,
  Duel,
  Player,
  PlayerId,
  PlayerSetup,
  Stack,
} from 'src/types'

export const initialDuelState: Readonly<Duel> = {
  cards: {},
  players: {},
  playerOrder: ['', ''],
  phase: 'intro',
  startingPlayerId: null,
  logs: [],
  pendingInstant: null,
}

let instanceIdCounter = 0

export const resetInstanceIdCounter = (): void => {
  instanceIdCounter = 0
}

export const generateInstanceId = (): number => instanceIdCounter++

export const getCardLife = (base: CardBase): number | undefined => {
  return base.type === 'character' ? base.life : undefined
}

export const getCardStrength = (base: CardBase): number | undefined => {
  return base.type === 'character' ? base.strength : undefined
}

export const createCardInstance = (
  baseId: CardBaseId,
  id?: number,
  life?: number,
  charges?: number,
): CardInstance => ({
  id: id ?? generateInstanceId(),
  baseId,
  cost: CARD_BASES[baseId].cost,
  life: life ?? getCardLife(CARD_BASES[baseId]),
  strength: getCardStrength(CARD_BASES[baseId]),
  charges:
    (charges ?? (CARD_BASES[baseId] as CardBaseCharacter).charges) || undefined,
  didAct: false,
  haste: false,
})

export const shuffle = <T>(
  array: T[],
  rng: () => number = Math.random,
): T[] => {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp
  }

  return shuffled
}

export const coinFlipForPlayerStart = (
  id1: PlayerId,
  id2: PlayerId,
  rng: () => number = Math.random,
): PlayerId => (rng() < 0.5 ? id1 : id2)

export interface CreateDuelParams {
  players: [PlayerSetup, PlayerSetup]
}

export interface CreateDuelOverrides extends Partial<Omit<Duel, 'players'>> {
  players?: Partial<Record<PlayerId, Partial<Player>>>
  stackOverrides?: Partial<
    Record<PlayerId, Partial<Record<Stack, CardBaseId[]>>>
  >
  rng?: () => number
}

const getDeckSummaryLog = (playerName: string, cards: CardBaseId[]): string => {
  const eliteCount = cards.filter(
    (baseId) => CARD_BASES[baseId].rank === 'elite',
  ).length
  const totalCost = cards.reduce(
    (sum, baseId) => sum + CARD_BASES[baseId].cost,
    0,
  )

  return `${playerName}'s deck: ${cards.length} cards / ${eliteCount} elites / ${totalCost} total cost.`
}

const getNextCardId = (duel: Duel): number => {
  const ids = Object.keys(duel.cards).map((id) => Number(id))
  if (ids.length === 0) return 1

  return Math.max(...ids) + 1
}

const buildStackIds = (baseIds: CardBaseId[] | undefined, startId: number) => {
  if (!baseIds) return { ids: undefined, cards: [], nextId: startId }

  let idCounter = startId
  const cards = baseIds.map((baseId) => createCardInstance(baseId, idCounter++))

  return {
    ids: cards.map((card) => card.id),
    cards,
    nextId: idCounter,
  }
}

const applyStackOverrides = (
  duel: Duel,
  stackOverrides: CreateDuelOverrides['stackOverrides'],
): Duel => {
  if (!stackOverrides) return duel

  let nextId = getNextCardId(duel)
  const newCards: Duel['cards'] = { ...duel.cards }
  const players = { ...duel.players }

  ;(Object.keys(stackOverrides) as PlayerId[]).forEach((playerId) => {
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

export const createDuel = (
  { players: playerSetups }: CreateDuelParams,
  overrides: CreateDuelOverrides = {},
): Duel => {
  resetInstanceIdCounter()

  const allCards: Record<number, CardInstance> = {}
  const players: Record<PlayerId, Player> = {}

  for (const setup of playerSetups) {
    const shuffledDeck = shuffle(setup.deck)
    const deckIds = shuffledDeck.map((baseId) => {
      const instance = createCardInstance(baseId)
      allCards[instance.id] = instance
      return instance.id
    })

    players[setup.id] = {
      ...PLACEHOLDER_PLAYER,
      id: setup.id,
      name: setup.name,
      deck: deckIds,
    }
  }

  const [p1, p2] = playerSetups
  const startingPlayerId = coinFlipForPlayerStart(p1.id, p2.id)
  const inactivePlayerId = startingPlayerId === p1.id ? p2.id : p1.id

  let duel: Duel = {
    ...initialDuelState,
    cards: allCards,
    players,
    playerOrder: [startingPlayerId, inactivePlayerId],
    startingPlayerId,
    logs: playerSetups.map((s) => getDeckSummaryLog(s.name, s.deck)),
  }

  const {
    stackOverrides,
    cards,
    players: playerOverrides,
    ...restOverrides
  } = overrides

  duel = applyStackOverrides(duel, stackOverrides)

  const mergedCards = cards ?? duel.cards
  const mergedPlayers = playerOverrides
    ? Object.fromEntries(
        Object.entries(duel.players).map(([id, player]) => [
          id,
          { ...player, ...(playerOverrides[id] ?? {}) },
        ]),
      )
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

export const updatePlayer = (
  duel: Duel,
  playerId: PlayerId,
  updates: Partial<Player>,
): Duel => ({
  ...duel,
  players: {
    ...duel.players,
    [playerId]: { ...duel.players[playerId], ...updates },
  },
})

export const drawTopCard = (
  duel: Readonly<Duel>,
  playerId: PlayerId,
): Readonly<Duel> => {
  const player = getPlayer(duel, playerId)

  if (player.deck.length === 0) return duel

  const [drawnCardId, ...remainingDeck] = player.deck

  if (drawnCardId == null) return duel

  return updatePlayer(duel, playerId, {
    deck: remainingDeck,
    hand: [...player.hand, drawnCardId],
  })
}

export const getOpponentId = (duel: Duel, playerId: PlayerId): PlayerId => {
  const [id1, id2] = duel.playerOrder
  return playerId === id1 ? id2 : id1
}
