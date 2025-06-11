import type { Meta, StoryObj } from '@storybook/react'

import { orderCardBases } from 'src/modules/cards/bases/order'
import { Card } from 'src/modules/cards/components/Card'

const meta: Meta<typeof Card> = {
  title: 'Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'This is a card component that displays a card from the game. It can be used to show character cards, instant cards, and other types of cards.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof Card>

export const OrderCharacter: Story = {
  args: {
    card: orderCardBases.templeGuard,
  },
}

export const EliteOrderInstant: Story = {
  args: {
    card: orderCardBases.yoraSkull,
  },
}
