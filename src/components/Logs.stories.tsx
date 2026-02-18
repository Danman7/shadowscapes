import type { Meta, StoryObj } from '@storybook/react'

import { Logs } from '@/components/Logs'
import { MOCK_LOGS } from '@/test/mocks/duelSetup'

const meta: Meta<typeof Logs> = {
  title: 'Duel/Logs',
  component: Logs,
  parameters: {
    layout: 'centered',
  },
  args: {
    logs: MOCK_LOGS,
  },
}

export default meta
type Story = StoryObj<typeof Logs>

export const Default: Story = {}

export const NoLogs: Story = {
  args: {
    logs: [],
  },
}
