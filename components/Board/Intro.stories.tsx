import type { Meta, StoryObj } from '@storybook/nextjs'

import { Intro } from '@/components/Board/Intro'

const meta: Meta<typeof Intro> = {
  title: 'Board/Intro',
  component: Intro,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    playerNames: {
      Player1: 'Basso',
      Player2: 'Victoria',
    },
    firstPlayerId: 'Player1',
  },
}

export default meta

type Story = StoryObj<typeof Intro>

export const Default: Story = {}
