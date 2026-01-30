import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'

import { Button } from '@/components/Button'

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Click Me',
    onClick: fn(),
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {}

export const Disabled: Story = {
  args: { onClick: undefined },
}
