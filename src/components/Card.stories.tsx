import type { Meta, StoryObj } from '@storybook/react'

import { Card } from '@/components/Card'
import { CARD_BASES } from '@/constants/cardBases'
import { createCardInstance } from '@/game-engine/utils'

const meta: Meta<typeof Card> = {
  title: 'Common/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    isOnBoard: false,
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Character: Story = {
  args: {
    card: createCardInstance('templeGuard'),
  },
}

export const OnBoard: Story = {
  args: {
    isOnBoard: true,
    card: createCardInstance('templeGuard'),
  },
}

export const Instant: Story = {
  args: {
    card: createCardInstance('bookOfAsh'),
  },
}

export const AllFactions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card card={createCardInstance('zombie')} />
      <Card card={createCardInstance('novice')} />
      <Card card={createCardInstance('downwinder')} />
      <Card card={createCardInstance('cook')} />
    </div>
  ),
}

export const AllCardsGallery: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      {Object.entries(CARD_BASES).map(([id, base]) => (
        <div key={id} className="flex flex-col gap-2">
          <Card card={createCardInstance(id as keyof typeof CARD_BASES)} />
          <div className="text-center text-sm font-semibold">{base.name}</div>
        </div>
      ))}
    </div>
  ),
}
