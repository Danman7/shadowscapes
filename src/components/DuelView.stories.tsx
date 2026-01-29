import type { Meta, StoryObj } from '@storybook/react'

import { DuelView } from '@/components/DuelView'
import { PLAYER_1_DECK, PLAYER_2_DECK } from '@/constants/testDecks'
import { GameProvider } from '@/contexts/GameContext'
import { createCardInstance } from '@/test/mocks/cardInstances'
import type { CardBaseId, Duel } from '@/types'

const meta: Meta<typeof DuelView> = {
  title: 'Components/DuelView',
  component: DuelView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof DuelView>

function buildDeckCards(baseIds: CardBaseId[], startId: number) {
  let idCounter = startId
  const cards = baseIds.map((baseId) => createCardInstance(idCounter++, baseId))

  return { cards, nextId: idCounter }
}

function buildInitialDeckState(): Partial<Duel> {
  const player1Deck = buildDeckCards(PLAYER_1_DECK, 1)
  const player2Deck = buildDeckCards(PLAYER_2_DECK, player1Deck.nextId)

  const cards = Object.fromEntries(
    [...player1Deck.cards, ...player2Deck.cards].map((card) => [card.id, card]),
  )

  return {
    cards,
    players: {
      player1: {
        id: 'player1',
        name: 'Alice',
        coins: 0,
        deckIds: player1Deck.cards.map((card) => card.id),
        handIds: [],
        boardIds: [],
        discardIds: [],
      },
      player2: {
        id: 'player2',
        name: 'Bob',
        coins: 0,
        deckIds: player2Deck.cards.map((card) => card.id),
        handIds: [],
        boardIds: [],
        discardIds: [],
      },
    },
    activePlayerId: 'player1',
    inactivePlayerId: 'player2',
    phase: 'initial-draw',
    startingPlayerId: 'player1',
  }
}

function splitStacks<T>(cards: T[]) {
  return {
    hand: cards.slice(0, 2),
    board: cards.slice(2, 4),
    discard: cards.slice(4, 6),
    deck: cards.slice(6),
  }
}

function buildMixedStacksState(): Partial<Duel> {
  const player1Deck = buildDeckCards(PLAYER_1_DECK, 1)
  const player2Deck = buildDeckCards(PLAYER_2_DECK, player1Deck.nextId)

  const player1Stacks = splitStacks(player1Deck.cards)
  const player2Stacks = splitStacks(player2Deck.cards)

  const cards = Object.fromEntries(
    [...player1Deck.cards, ...player2Deck.cards].map((card) => [card.id, card]),
  )

  return {
    cards,
    players: {
      player1: {
        id: 'player1',
        name: 'Alice',
        coins: 2,
        deckIds: player1Stacks.deck.map((card) => card.id),
        handIds: player1Stacks.hand.map((card) => card.id),
        boardIds: player1Stacks.board.map((card) => card.id),
        discardIds: player1Stacks.discard.map((card) => card.id),
      },
      player2: {
        id: 'player2',
        name: 'Bob',
        coins: 2,
        deckIds: player2Stacks.deck.map((card) => card.id),
        handIds: player2Stacks.hand.map((card) => card.id),
        boardIds: player2Stacks.board.map((card) => card.id),
        discardIds: player2Stacks.discard.map((card) => card.id),
      },
    },
    activePlayerId: 'player1',
    inactivePlayerId: 'player2',
    phase: 'player-turn',
    startingPlayerId: 'player1',
  }
}

export const InitialDecks: Story = {
  render: () => (
    <GameProvider preloadedState={buildInitialDeckState()}>
      <DuelView />
    </GameProvider>
  ),
}

export const MixedStacks: Story = {
  render: () => (
    <GameProvider preloadedState={buildMixedStacksState()}>
      <DuelView />
    </GameProvider>
  ),
}
