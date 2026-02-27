import type { Meta, StoryObj } from '@storybook/react'

import { CardBack } from 'src/components/CardBack'

const meta: Meta<typeof CardBack> = {
  title: 'Common/CardBack',
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

export const Small: Story = {
  args: {
    isSmall: true,
  },
}
