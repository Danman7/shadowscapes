import type { Meta, StoryObj } from '@storybook/react'

import { PlayerBadge } from 'src/components'
import { PLACEHOLDER_PLAYER } from 'src/constants/duelParams'

const meta: Meta<typeof PlayerBadge> = {
  title: 'Duel/PlayerBadge',
  component: PlayerBadge,
  parameters: {
    layout: 'centered',
  },
  args: {
    player: {
      ...PLACEHOLDER_PLAYER,
      name: 'Player 1',
      id: 'player1',
    },
    isActive: false,
  },
}

export default meta
type Story = StoryObj<typeof PlayerBadge>

export const Default: Story = {}

export const Active: Story = {
  args: { isActive: true },
}
