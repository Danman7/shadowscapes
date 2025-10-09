import type { Meta, StoryObj } from '@storybook/nextjs'
import { fn } from 'storybook/test'

import { Button } from '@/components/Button'


const meta: Meta<typeof Button> = {
  title: 'Shared/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'This is a button',
    onClick: fn(),
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {}
