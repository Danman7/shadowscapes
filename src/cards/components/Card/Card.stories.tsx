import type { Meta, StoryObj } from '@storybook/react'

import { Card } from './Card'
import { cardBases } from '../../bases'

const meta = {
  title: 'Cards/Card',
  component: Card,
  args: {
    card: cardBases['templeGuard'],
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const CardsGallery: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      {Object.entries(cardBases).map(([id, card]) => (
        <div key={id} className="flex flex-col gap-2">
          <Card card={card} />
          <div className="text-center">{id}</div>
        </div>
      ))}
    </div>
  ),
}

export const Character: Story = {}

export const Instance: Story = {
  args: {
    card: cardBases['bookOfAsh'],
  },
}
