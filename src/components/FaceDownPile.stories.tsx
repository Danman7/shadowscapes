import type { Meta, StoryObj } from '@storybook/react'

import { FaceDownPile } from '@/components/FaceDownPile'

const meta: Meta<typeof FaceDownPile> = {
  title: 'Components/FaceDownPile',
  component: FaceDownPile,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Deck',
    count: 10,
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof FaceDownPile>

export const Default: Story = {}

export const EmptyDeck: Story = {
  args: {
    count: 0,
    label: 'Deck',
  },
}
