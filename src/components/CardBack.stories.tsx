import type { Meta, StoryObj } from '@storybook/react'

import { CardBack } from '@/components/CardBack'

const meta: Meta<typeof CardBack> = {
  title: 'Common/CardBack',
  component: CardBack,
  parameters: {
    layout: 'centered',
  },
  args: {
    isSmall: false,
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CardBack>

export const Default: Story = {}

export const Small: Story = {
  args: {
    isSmall: true,
  },
}
