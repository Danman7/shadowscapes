import type { Meta, StoryObj } from '@storybook/react'

import { Board } from '@/components/Board'
import { createCardInstance } from '@/test/mocks/cardInstances'

const meta: Meta<typeof Board> = {
  title: 'Duel/Board',
  component: Board,
  parameters: {
    layout: 'centered',
  },
  args: {
    cards: [
      createCardInstance(1, 'zombie', 2),
      createCardInstance(2, 'templeGuard', 3),
      createCardInstance(3, 'downwinder', 2),
    ],
  },
}

export default meta
type Story = StoryObj<typeof Board>

export const Default: Story = {}
