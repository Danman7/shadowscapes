import {
  CARD_BASES,
  INITIAL_DUEL_STATE,
  PLACEHOLDER_PLAYER,
} from 'src/game-engine/constants'
import type {
  CardAttributes,
  CardBaseId,
  CardInstance,
  Duel,
  DuelCards,
  DuelLog,
  DuelPlayerOrder,
  DuelPlayers,
  PendingInstant,
  Player,
  PlayerId,
  PlayerSetup,
} from 'src/game-engine/types'

export const generateUuid = (): string => crypto.randomUUID()

export type AttributeOverride = Partial<CardAttributes>

export const createCardInstance = (
  baseId: CardBaseId,
  id?: string,
  attributeOverrides?: AttributeOverride,
): CardInstance => {
  const base = CARD_BASES[baseId]

  return {
    id: id ?? generateUuid(),
    base,
    attributes: { ...base.attributes, ...attributeOverrides },
    didAct: false,
  }
}

const getDeckSummaryLog = (playerName: string, cards: CardBaseId[]): string => {
  const eliteCount = cards.filter(
    (baseId) => CARD_BASES[baseId].rank === 'elite',
  ).length
  const totalCost = cards.reduce(
    (sum, baseId) => sum + CARD_BASES[baseId].attributes.cost,
    0,
  )

  return `${playerName}'s deck: ${cards.length} cards / ${eliteCount} elites / ${totalCost} total cost.`
}

const shuffle = <T>(array: T[], rng: () => number = Math.random): T[] => {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp
  }

  return shuffled
}

export type CreateDuelParams = [PlayerSetup, PlayerSetup]

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

export const drawTopCard = (player: Player): Player => {
  if (player.deck.length === 0) return player

  const [drawnCardId, ...remainingDeck] = player.deck

  return {
    ...player,
    deck: remainingDeck,
    hand: [...player.hand, drawnCardId],
  }
}

export const getOpponentId = (
  playerOrder: DuelPlayerOrder,
  playerId: PlayerId,
): PlayerId => (playerOrder[0] === playerId ? playerOrder[1] : playerOrder[0])

export const hasCharactersInHand = (
  hand: string[],
  cards: Record<string, CardInstance>,
): boolean => hand.some((id) => cards[id]?.base.type === 'character')

export const hasBoardCards = (players: Record<string, Player>): boolean =>
  Object.values(players).some((p) => p.board.length > 0)

export const getPendingInstant = (
  card: CardInstance,
  hand: string[],
  state: Readonly<Duel>,
): PendingInstant | null => {
  if (card.base.id === 'speedPotion' && hasCharactersInHand(hand, state.cards))
    return 'SPEED_POTION'
  if (card.base.id === 'flashBomb' && hasBoardCards(state.players))
    return 'FLASH_BOMB'
  return null
}

export const updatePlayers = (
  players: DuelPlayers,
  playerId: PlayerId,
  updater: (player: Player) => Player,
): DuelPlayers => ({
  ...players,
  [playerId]: updater(players[playerId]),
})

export const updateCard = (
  cards: DuelCards,
  cardId: string,
  updater: (card: CardInstance) => CardInstance,
): DuelCards => ({
  ...cards,
  [cardId]: updater(cards[cardId]),
})

export const resetPlayers = (players: DuelPlayers): DuelPlayers =>
  Object.fromEntries(
    Object.entries(players).map(([id, player]) => [
      id,
      { ...player, playerReady: false },
    ]),
  )

export const resetCards = (cards: DuelCards): DuelCards =>
  Object.fromEntries(
    Object.entries(cards).map(([id, card]) => [
      id,
      {
        ...card,
        didAct: false,
        attributes: { ...card.attributes, stunned: false },
      },
    ]),
  )

export const addLogEntry = (logs: DuelLog[], entry: string): DuelLog[] => [
  ...logs,
  entry,
]
