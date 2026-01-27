import type { Meta, StoryObj } from '@storybook/react'

import { CardBack } from '@/components/CardBack'

const meta: Meta<typeof CardBack> = {
  title: 'Components/CardBack',
  component: CardBack,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CardBack>

export const Default: Story = {
  args: {},
}

export const WithCustomClass: Story = {
  args: {
    className: 'custom-styling',
  },
}

export const Multiple: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <CardBack />
      <CardBack />
      <CardBack />
    </div>
  ),
}
