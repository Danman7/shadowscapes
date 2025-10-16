import type { Meta, StoryObj } from '@storybook/nextjs'

import { Card } from '@/components/Card'
import {
  CardCategories,
  CardDefinitionIds,
  CardRanks,
  Factions,
  cardDefinitions,
} from '@/data'

const meta: Meta<typeof Card> = {
  title: 'Cards/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    id: {
      control: { type: 'select' },
      options: Object.values(CardDefinitionIds),
    },
    faction: {
      control: { type: 'select' },
      options: Object.values(Factions),
    },
    rank: {
      control: { type: 'select' },
      options: Object.values(CardRanks),
    },
    categories: {
      control: { type: 'multi-select' },
      options: Object.values(CardCategories),
    },
    kind: { control: { type: 'radio' }, options: ['Character', 'Instant'] },
  },
  args: {
    ...cardDefinitions.TempleGuard,
  },
}

export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {}

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
