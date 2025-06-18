import type { Meta, StoryObj } from '@storybook/react'

import { BoardCard } from 'src/modules/duel/components/BoardCard'
import { DuelProvider } from 'src/modules/duel/components/DuelProvider'
import { mockStackedDuelState } from 'src/modules/duel/mocks'
import { UserProvider } from 'src/modules/user/components/UserProvider'
import { mockLoadedUserState } from 'src/modules/user/mocks'

const meta: Meta<typeof BoardCard> = {
  title: 'Duel/BoardCard',
  component: BoardCard,
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
    layout: 'centered',
    docs: {
      description: {
        component:
          "This is the stateful duel board card component that displays a card from one of the player's stacks. It also accesses context to determine if the card is face down or not and what would be its on click behavior.",
      },
    },
  },
  args: {
    cardId:
      mockStackedDuelState.players[mockStackedDuelState.activePlayerId].hand[0],
  },
  tags: ['Stateful', 'Impure'],
}

export default meta

type Story = StoryObj<typeof BoardCard>

export const FaceUp: Story = {}

export const FaceDown: Story = {
  args: {
    cardId:
      mockStackedDuelState.players[mockStackedDuelState.activePlayerId].deck[0],
  },
}

export const HiddenOnOpponentBoard: Story = {
  args: {
    cardId:
      mockStackedDuelState.players[mockStackedDuelState.inactivePlayerId]
        .board[1],
  },
}
