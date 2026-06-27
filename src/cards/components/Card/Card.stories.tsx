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

export const Character: Story = {}
