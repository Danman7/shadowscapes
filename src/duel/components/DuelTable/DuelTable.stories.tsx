import type { Meta, StoryObj } from '@storybook/react'

import { mockChaosUser, mockOrderUser, setupMockedDuel } from '../../../user'
import { DuelProvider } from '../DuelProvider/DuelProvider'
import { DuelTable } from './DuelTable'

const initialState = setupMockedDuel({
  activePlayer: { deck: mockOrderUser.activeDeck },
  inactivePlayer: { deck: mockChaosUser.activeDeck },
})

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

const meta = {
  title: 'Duel/Duel Table',
  component: DuelTable,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DuelTable>

export default meta

type Story = StoryObj<typeof meta>

export const InitialState: Story = {
  render: () => (
    <DuelProvider preloadedState={initialState}>
      <DuelTable />
    </DuelProvider>
  ),
}

export const EveryStack: Story = {
  render: () => (
    <DuelProvider preloadedState={everyStackState}>
      <DuelTable />
    </DuelProvider>
  ),
}
