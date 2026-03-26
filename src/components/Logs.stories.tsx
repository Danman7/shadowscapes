import type { Meta, StoryObj } from '@storybook/react'

import { Logs } from 'src/components'
import { MOCK_LOGS } from 'src/game-engine/mocks'

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
