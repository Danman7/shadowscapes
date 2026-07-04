import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './Button'

const meta = {
  title: 'Shared/Button',
  component: Button,
  args: {
    label: 'Pass',
    onClick: () => undefined,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ReactNodeLabel: Story = {
  args: {
    label: <span aria-label="Pass turn">Pass →</span>,
  },
}
