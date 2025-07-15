import type { Meta, StoryObj } from '@storybook/react'

import { FullScreenLoader } from 'src/components/FullScreenLoader'

const meta: Meta<typeof FullScreenLoader> = {
  title: 'Shared/FullScreenLoader',
  component: FullScreenLoader,
  args: {
    message: 'Loading...',
  },
}

export default meta

type Story = StoryObj<typeof FullScreenLoader>

export const Default: Story = {}
