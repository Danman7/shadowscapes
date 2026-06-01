import type { Meta, StoryObj } from '@storybook/react'

import { FaceDownPile } from 'src/components'
import { createCardInstance } from 'src/game-engine'

const meta: Meta<typeof FaceDownPile> = {
  title: 'Duel/FaceDownPile',
  component: FaceDownPile,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Deck',
    count: 10,
    flipped: false,
  },
}

export default meta
type Story = StoryObj<typeof FaceDownPile>

export const Default: Story = {}

export const Flipped: Story = {
  args: {
    flipped: true,
  },
}

export const WithCardAnchors: Story = {
  args: {
    cards: [
      createCardInstance('zombie', 'pile-1'),
      createCardInstance('haunt', 'pile-2'),
      createCardInstance('templeGuard', 'pile-3'),
      createCardInstance('downwinder', 'pile-4'),
    ],
    count: undefined,
  },
}

export const EmptyDeck: Story = {
  args: {
    count: 0,
    label: 'Deck',
  },
}
