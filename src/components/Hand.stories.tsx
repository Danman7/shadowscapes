import type { Meta, StoryObj } from '@storybook/react'

import { Hand } from 'src/components'
import { createCardInstance } from 'src/reducers/helpers'

const meta: Meta<typeof Hand> = {
  title: 'Duel/Hand',
  component: Hand,
  parameters: {
    layout: 'centered',
  },
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

export const WithSelectiveClickable: Story = {
  args: {
    cards: sampleCards,
    isActive: true,
    onCardClick: (cardId) => {
      // Only first two cards are clickable
      if (cardId === sampleCards[0]?.id || cardId === sampleCards[1]?.id) {
        return () => console.log(`Clicked card ${cardId}`)
      }
      return undefined
    },
  },
}

export const AllClickable: Story = {
  args: {
    cards: sampleCards,
    isActive: true,
    onCardClick: (cardId) => () => console.log(`Clicked card ${cardId}`),
  },
}
