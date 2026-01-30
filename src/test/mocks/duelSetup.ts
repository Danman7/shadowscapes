import { PLAYER_1_DECK, PLAYER_2_DECK } from '@/constants/testDecks'
import { createDuel } from '@/game-engine/initialization'
import { getCardStrength } from '@/game-engine/utils'
import { CARD_BASES } from '@/constants/cardBases'
import type { CardBaseId, Duel, Phase, PlayerId, Stack } from '@/types'
import { createCardInstance } from '@/test/mocks/cardInstances'

export interface DuelSetupMock {
  player1Name: string
  player2Name: string
  player1Deck: CardBaseId[]
  player2Deck: CardBaseId[]
}

export const DEFAULT_DUEL_SETUP: DuelSetupMock = {
  player1Name: 'Garrett',
  player2Name: 'Constantine',
  player1Deck: PLAYER_1_DECK,
  player2Deck: PLAYER_2_DECK,
}

export const PRELOADED_DUEL_SETUP = createDuel(DEFAULT_DUEL_SETUP)

export type PlayerStackOverrides = Partial<Record<Stack, CardBaseId[]>>

export interface BuildDuelStateOptions {
  player1?: PlayerStackOverrides
  player2?: PlayerStackOverrides
  activePlayerId?: PlayerId
  inactivePlayerId?: PlayerId
  startingPlayerId?: PlayerId | null
  phase?: Phase
}

function getNextCardId(duel: Duel): number {
  const ids = Object.keys(duel.cards).map((id) => Number(id))
  if (ids.length === 0) {
    return 1
  }

  return Math.max(...ids) + 1
}

function buildDeckCards(baseIds: CardBaseId[], startId: number) {
  let idCounter = startId
  const cards = baseIds.map((baseId) => createCardInstance(idCounter++, baseId))

  return { cards, nextId: idCounter }
}

function buildStackIds(baseIds: CardBaseId[] | undefined, startId: number) {
  if (!baseIds) {
    return { ids: undefined, cards: [], nextId: startId }
  }

  const { cards, nextId } = buildDeckCards(baseIds, startId)
  return {
    ids: cards.map((card) => card.id),
    cards,
    nextId,
  }
}

function normalizeBaseCard(card: ReturnType<typeof createCardInstance>) {
  const base = CARD_BASES[card.baseId]
  return {
    id: card.id,
    baseId: card.baseId,
    type: base.type,
    strength: getCardStrength(base),
  }
}

/**
 * Builds a duel state using PRELOADED_DUEL_SETUP as a base.
 * Provide card base IDs per player stack to override those stacks.
 */
export function buildDuelState(
  options: BuildDuelStateOptions = {},
): Partial<Duel> {
  const base = PRELOADED_DUEL_SETUP
  let nextId = getNextCardId(base)

  const playerOverrides: Record<PlayerId, PlayerStackOverrides | undefined> = {
    player1: options.player1,
    player2: options.player2,
  }

  const newCards: Duel['cards'] = { ...base.cards }
  const players = { ...base.players }

  ;(['player1', 'player2'] as const).forEach((playerId) => {
    const overrides = playerOverrides[playerId]
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
        newCards[card.id] = normalizeBaseCard(card)
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
    ...base,
    ...options,
    cards: newCards,
    players,
    activePlayerId: options.activePlayerId ?? base.activePlayerId,
    inactivePlayerId: options.inactivePlayerId ?? base.inactivePlayerId,
    startingPlayerId: options.startingPlayerId ?? base.startingPlayerId,
    phase: options.phase ?? base.phase,
  }
}

export const MIXED_STACKS_DUEL = buildDuelState({
  phase: 'player-turn',
  startingPlayerId: 'player1',
  activePlayerId: 'player1',
  inactivePlayerId: 'player2',
  player1: {
    hand: PLAYER_1_DECK.slice(0, 2),
    board: PLAYER_1_DECK.slice(2, 4),
    discard: PLAYER_1_DECK.slice(4, 6),
    deck: PLAYER_1_DECK.slice(6),
  },
  player2: {
    hand: PLAYER_2_DECK.slice(0, 2),
    board: PLAYER_2_DECK.slice(2, 4),
    discard: PLAYER_2_DECK.slice(4, 6),
    deck: PLAYER_2_DECK.slice(6),
  },
})
