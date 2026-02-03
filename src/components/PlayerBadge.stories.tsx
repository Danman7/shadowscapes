import type { Meta, StoryObj } from '@storybook/react'

import { PlayerBadge } from '@/components/PlayerBadge'

const meta: Meta<typeof PlayerBadge> = {
  title: 'Duel/PlayerBadge',
  component: PlayerBadge,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Player Name',
    isActive: false,
  },
}

export default meta
type Story = StoryObj<typeof PlayerBadge>

export const Default: Story = {}

export const Active: Story = {
  args: { isActive: true },
}
