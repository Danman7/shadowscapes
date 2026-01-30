import type { Meta, StoryObj } from '@storybook/react'

import { Card } from '@/components/Card'
import { CARD_BASES } from '@/constants/cardBases'
import { getCardStrength } from '@/game-engine/utils'

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
    card: {
      id: 2,
      baseId: 'templeGuard',
      type: 'character',
      strength: 3,
      base: CARD_BASES.templeGuard,
    },
  },
}

export const OnBoard: Story = {
  args: {
    isOnBoard: true,
    card: {
      id: 2,
      baseId: 'templeGuard',
      type: 'character',
      strength: 3,
      base: CARD_BASES.templeGuard,
    },
  },
}

export const Instant: Story = {
  args: {
    card: {
      id: 4,
      baseId: 'bookOfAsh',
      type: 'instant',
      base: CARD_BASES.bookOfAsh,
    },
  },
}

export const AllFactions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card
        card={{
          id: 7,
          baseId: 'zombie',
          type: 'character',
          strength: 1,
          base: CARD_BASES.zombie,
        }}
      />
      <Card
        card={{
          id: 8,
          baseId: 'novice',
          type: 'character',
          strength: 1,
          base: CARD_BASES.novice,
        }}
      />
      <Card
        card={{
          id: 9,
          baseId: 'downwinder',
          type: 'character',
          strength: 2,
          base: CARD_BASES.downwinder,
        }}
      />
      <Card
        card={{
          id: 10,
          baseId: 'cook',
          type: 'character',
          strength: 1,
          base: CARD_BASES.cook,
        }}
      />
    </div>
  ),
}

export const AllCardsGallery: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      {Object.entries(CARD_BASES).map(([id, base], index) => (
        <div key={id} className="flex flex-col gap-2">
          <Card
            card={{
              id: index + 1,
              baseId: id as keyof typeof CARD_BASES,
              type: base.type,
              strength: getCardStrength(base),
              base,
            }}
          />
          <div className="text-center text-sm font-semibold">{base.name}</div>
        </div>
      ))}
    </div>
  ),
}
