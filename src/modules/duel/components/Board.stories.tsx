import type { Meta, StoryObj } from '@storybook/react'

import { Board } from 'src/modules/duel/components/Board'
import { DuelProvider } from 'src/modules/duel/components/DuelProvider'
import { mockStackedDuelState } from 'src/modules/duel/mocks'
import { UserProvider } from 'src/modules/user/components/UserProvider'
import { mockLoadedUserState } from 'src/modules/user/mocks'

const meta: Meta<typeof Board> = {
  title: 'Duel/Board',
  component: Board,
  decorators: [
    (Story) => (
      <UserProvider preloadedState={mockLoadedUserState}>
        <DuelProvider preloadedState={mockStackedDuelState}>
          <Story />
        </DuelProvider>
      </UserProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "This is the primary Duel component that displays the whole game board, each player's info and additional action UI elements like modals and buttons.",
      },
    },
  },
  tags: ['Stateful', '!autodocs'],
}

export default meta

type Story = StoryObj<typeof Board>

export const Default: Story = {}

export const UserNotInDuel: Story = {
  decorators: [
    (Story) => (
      <UserProvider
        preloadedState={{
          ...mockLoadedUserState,
          user: {
            ...mockLoadedUserState.user,
            id: 'user-not-in-game',
          },
        }}
      >
        <DuelProvider preloadedState={mockStackedDuelState}>
          <Story />
        </DuelProvider>
      </UserProvider>
    ),
  ],
}

export const Loading: Story = {
  decorators: [
    (Story) => (
      <UserProvider
        preloadedState={{ ...mockLoadedUserState, isUserLoaded: false }}
      >
        <DuelProvider preloadedState={mockStackedDuelState}>
          <Story />
        </DuelProvider>
      </UserProvider>
    ),
  ],
}
