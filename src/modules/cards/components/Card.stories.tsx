import type { Meta, StoryObj } from '@storybook/react'

import { orderCardBases } from 'src/modules/cards/bases/order'
import { Card } from 'src/modules/cards/components/Card'

const meta: Meta<typeof Card> = {
  title: 'Cards/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'This is a card component that displays a card from the game.',
      },
    },
  },
  args: {
    isFaceDown: false,
    card: orderCardBases.templeGuard,
  },
}

export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {}

export const FaceDown: Story = {
  args: {
    isFaceDown: true,
  },
}
