import type { Meta, StoryObj } from '@storybook/react'

import { allCardBases } from 'src/modules/cards/bases'
import { Card } from 'src/modules/cards/components/Card'

const meta: Meta<typeof Card> = {
  title: 'Cards/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'This is the fundamental stateless UI component that displays a card from the game.',
      },
    },
  },
  args: {
    card: allCardBases.templeGuard,
  },
}

export default meta

type Story = StoryObj<typeof Card>

export const Fighter: Story = {}

export const Agent: Story = {
  args: {
    card: allCardBases.cook,
  },
}

export const Instant: Story = {
  args: {
    card: allCardBases.yoraSkull,
  },
}
