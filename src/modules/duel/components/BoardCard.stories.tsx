import type { Meta, StoryObj } from '@storybook/react'

import { BoardCard } from 'src/modules/duel/components/BoardCard'
import { createDuelCardFromBase } from 'src/modules/duel/utils'

const [, duelCard] = createDuelCardFromBase('templeGuard')

const meta: Meta<typeof BoardCard> = {
  title: 'Duel/BoardCard',
  component: BoardCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "This is the stateful duel board card component that displays a card from one of the player's stacks. It also accesses context to determine if the card is face down or not and what would be its on click behavior.",
      },
    },
  },
  args: {
    isFaceDown: false,
    duelCard,
  },
}

export default meta

type Story = StoryObj<typeof BoardCard>

export const Default: Story = {}

export const FaceDown: Story = {
  args: {
    isFaceDown: true,
  },
}
