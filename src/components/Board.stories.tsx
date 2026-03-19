import type { Meta, StoryObj } from '@storybook/react'

import { Board } from 'src/components'
import { createCardInstance } from 'src/reducers/helpers'

const meta: Meta<typeof Board> = {
  title: 'Duel/Board',
  component: Board,
  parameters: {
    layout: 'centered',
  },
  args: {
    cards: [
      createCardInstance('zombie'),
      createCardInstance('templeGuard'),
      createCardInstance('downwinder'),
    ],
  },
}

export default meta
type Story = StoryObj<typeof Board>

export const Default: Story = {}
