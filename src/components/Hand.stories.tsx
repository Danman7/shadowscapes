import type { Meta, StoryObj } from '@storybook/react'

import { Hand } from '@/components/Hand'
import { createCardInstance } from '@/game-engine/utils'

const meta: Meta<typeof Hand> = {
  title: 'Duel/Hand',
  component: Hand,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Hand>

const sampleCards = [
  createCardInstance('zombie'),
  createCardInstance('templeGuard'),
  createCardInstance('downwinder'),
]

export const ActiveHand: Story = {
  args: {
    cards: sampleCards,
    isActive: true,
  },
}

export const InactiveHand: Story = {
  args: {
    cards: sampleCards,
    isActive: false,
  },
}

export const EmptyHand: Story = {
  args: {
    cards: [],
    isActive: true,
  },
}

export const SingleCard: Story = {
  args: {
    cards: [sampleCards[0]!],
    isActive: true,
  },
}
