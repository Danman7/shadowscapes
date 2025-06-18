import type { Meta, StoryObj } from '@storybook/react'

import { MoonLoading } from 'src/components/MoonLoading'

const meta: Meta<typeof MoonLoading> = {
  title: 'Shared/MoonLoading',
  component: MoonLoading,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "This is a loading component that displays a moon loading animation. It's size is controlled by the font-size of the parent element.",
      },
    },
  },
  tags: ['Stateless', 'Pure'],
}

export default meta

type Story = StoryObj<typeof MoonLoading>

export const Default: Story = {}

export const Large: Story = {
  decorators: [
    (Story) => (
      <div style={{ fontSize: '3em' }}>
        <Story />
      </div>
    ),
  ],
}
