import type { Meta, StoryObj } from '@storybook/react'

import { FaceDownPile } from 'src/components/FaceDownPile'

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

export const EmptyDeck: Story = {
  args: {
    count: 0,
    label: 'Deck',
  },
}
