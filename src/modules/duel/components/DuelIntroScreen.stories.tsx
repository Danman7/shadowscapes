import type { Meta, StoryObj } from '@storybook/react'

import { DuelIntroScreen } from 'src/modules/duel/components/DuelIntroScreen'
import { mockInitializeDuelMockState } from 'src/modules/duel/mocks'

const { players, activePlayerId, inactivePlayerId } =
  mockInitializeDuelMockState

const meta: Meta<typeof DuelIntroScreen> = {
  title: 'Duel/DuelIntroScreen',
  component: DuelIntroScreen,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'This is shown when the duel starts, before the first turn begins.',
      },
    },
  },
  args: {
    players,
    activePlayerId,
    userId: activePlayerId, // Assuming the user is the active player for this story
  },
  tags: ['Stateless'],
}

export default meta

type Story = StoryObj<typeof DuelIntroScreen>

export const Default: Story = {}

export const OpponentFirst: Story = {
  args: {
    activePlayerId: inactivePlayerId,
  },
}

export const PlayerNotInGame: Story = {
  args: {
    userId: 'test',
  },
}
