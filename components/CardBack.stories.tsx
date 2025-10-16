import type { Meta, StoryObj } from '@storybook/nextjs'

import { CardBack } from '@/components/CardBack'

const meta: Meta<typeof CardBack> = {
  title: 'Cards/CardBack',
  component: CardBack,
  parameters: {
    layout: 'centered',
  },
  args: {
    isSmall: false,
  },
}

export default meta

type Story = StoryObj<typeof CardBack>

export const Default: Story = {}
