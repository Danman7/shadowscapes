import type { Meta, StoryObj } from '@storybook/nextjs'

import { Card } from '@/components/Card'
import { cardDefinitions } from '@/data'

const meta: Meta<typeof Card> = {
  title: 'Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  args: {
    ...cardDefinitions.TempleGuard,
  },
}

export default meta

type Story = StoryObj<typeof Card>

export const Character: Story = {}

export const Instant: Story = { args: { ...cardDefinitions.YoraSkull } }

export const AllCardsGallery = () => (
  <div className="flex gap-4 flex-wrap">
    {Object.entries(cardDefinitions).map(([name, card]) => (
      <div key={name}>
        <Card {...card} />
        <div className="text-center mt-2">{name}</div>
      </div>
    ))}
  </div>
)
