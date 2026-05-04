import type { Meta, StoryObj } from '@storybook/react'

import { PlayerBadge } from 'src/components'
import { PLACEHOLDER_PLAYER } from 'src/game-engine'

const player = {
  ...PLACEHOLDER_PLAYER,
  name: 'Player 1',
  id: 'player1',
}

const meta: Meta<typeof PlayerBadge> = {
  title: 'Duel/PlayerBadge',
  component: PlayerBadge,
  parameters: {
    layout: 'centered',
  },
  args: {
    player,
    isActive: false,
  },
}

export default meta
type Story = StoryObj<typeof PlayerBadge>

export const Default: Story = {}

export const Active: Story = {
  args: { isActive: true },
}

export const Ready: Story = {
  args: {
    player: {
      ...player,
      playerReady: true,
    },
  },
}
