import type { Meta, StoryObj } from '@storybook/react'
import { Card } from 'src/modules/cards/components/Card'
import { orderCardBases } from 'src/modules/cards/bases/order'

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
