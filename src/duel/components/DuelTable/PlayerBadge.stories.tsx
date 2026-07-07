import type { Meta, StoryObj } from '@storybook/react'

import { mockOrderPlayer } from '../../state'
import { PlayerBadge } from './PlayerBadge'

const meta = {
  title: 'Duel/PlayerBadge',
  component: PlayerBadge,
  parameters: {
    layout: 'centered',
  },
  args: {
    player: mockOrderPlayer,
  },
} satisfies Meta<typeof PlayerBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Active: Story = {
  args: {
    isActive: true,
  },
}

export const WithIncome: Story = {
  args: {
    player: {
      ...mockOrderPlayer,
      income: 5,
    },
  },
}
