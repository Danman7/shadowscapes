import type { Meta, StoryObj } from '@storybook/react'

import { orderCardBases } from 'src/modules/cards/bases/order'
import { Card } from 'src/modules/cards/components/Card'

const meta: Meta<typeof Card> = {
  title: 'Card',
  component: Card,
}

export default meta

type Story = StoryObj<typeof Card>

export const Character: Story = {
  args: {
    card: orderCardBases.templeGuard,
  },
}

export const Instant: Story = {
  args: {
    card: orderCardBases.yoraSkull,
  },
}
