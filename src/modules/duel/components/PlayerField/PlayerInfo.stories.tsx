import type { Meta, StoryObj } from '@storybook/react'

import { PlayerInfo } from 'src/modules/duel/components/PlayerField/PlayerInfo'
import { mockInitializeDuelMockState } from 'src/modules/duel/mocks'
import { DuelPlayer } from 'src/modules/duel/types'

const { players, activePlayerId } = mockInitializeDuelMockState

const player: DuelPlayer = players[activePlayerId]

const meta: Meta<typeof PlayerInfo> = {
  title: 'Duel/PlayerInfo',
  component: PlayerInfo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'This is a surface that shows player duel information.',
      },
    },
  },
  args: {
    player,
  },
  tags: ['Stateless'],
}

export default meta

type Story = StoryObj<typeof PlayerInfo>

export const Default: Story = {}

export const WithIncome: Story = {
  args: {
    player: {
      ...player,
      income: 2,
    },
  },
}

export const LongPlayerName: Story = {
  args: {
    player: {
      ...player,
      name: 'This is a very long player name that should be truncated',
    },
  },
}

export const ActivePlayer: Story = {
  args: {
    isActive: true,
  },
}

export const RedrawReady: Story = {
  args: {
    isReady: true,
  },
}
