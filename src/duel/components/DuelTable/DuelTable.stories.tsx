import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import {
  mockChaosUser,
  mockOrderUser,
  mockPlayer1,
  mockPlayer2,
  setupMockedDuel,
} from '../../../user'
import {
  duelReducer,
  initiateDuelFromUsers,
  initiateSoloRandomAiDuel,
} from '../../state'
import { DuelProvider } from '../DuelProvider/DuelProvider'
import { DuelTable } from './DuelTable'

const everyStackState = setupMockedDuel({
  activePlayer: {
    hand: 'novice',
    deck: 'templeGuard',
    board: 'yoraSkull',
    discard: 'acolyte',
  },
  inactivePlayer: {
    hand: 'zombie',
    deck: 'haunt',
    board: 'bookOfAsh',
    discard: 'zombie',
  },
  phase: 'play',
})

const bookOfAshSelectionState = setupMockedDuel({
  activePlayer: {
    board: 'bookOfAsh',
    discard: ['haunt', 'zombie'],
  },
  phase: 'play',
})

bookOfAshSelectionState.pendingPlayedCardId =
  bookOfAshSelectionState.players[
    bookOfAshSelectionState.playerOrder[0]
  ].board[0]

const winnerState = setupMockedDuel({
  activePlayer: { coins: 0, board: 'novice' },
  inactivePlayer: { board: 'haunt' },
  phase: 'play',
})

winnerState.winnerId = winnerState.playerOrder[1]

const meta = {
  title: 'Duel/Duel Table',
  component: DuelTable,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DuelTable>

export default meta

type Story = StoryObj<typeof meta>

const InitialDuel = () => {
  const [initialState] = useState(() =>
    duelReducer(undefined, initiateDuelFromUsers([mockPlayer1, mockPlayer2])),
  )

  return (
    <DuelProvider preloadedState={initialState}>
      <DuelTable />
    </DuelProvider>
  )
}

const SoloRandomAiDuel = () => {
  const [initialState] = useState(() =>
    duelReducer(
      undefined,
      initiateSoloRandomAiDuel({
        human: mockOrderUser,
        ai: mockChaosUser,
      }),
    ),
  )

  return (
    <DuelProvider preloadedState={initialState}>
      <DuelTable />
    </DuelProvider>
  )
}

export const InitialState: Story = {
  render: () => <InitialDuel />,
}

export const SoloRandomAi: Story = {
  render: () => <SoloRandomAiDuel />,
}

export const EveryStack: Story = {
  render: () => (
    <DuelProvider preloadedState={everyStackState}>
      <DuelTable />
    </DuelProvider>
  ),
}

export const BookOfAshSelection: Story = {
  render: () => (
    <DuelProvider preloadedState={bookOfAshSelectionState}>
      <DuelTable />
    </DuelProvider>
  ),
}

export const Winner: Story = {
  render: () => (
    <DuelProvider preloadedState={winnerState}>
      <DuelTable />
    </DuelProvider>
  ),
}
