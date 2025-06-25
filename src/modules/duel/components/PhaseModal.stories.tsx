import type { Meta, StoryObj } from '@storybook/react'

import { PhaseModal } from 'src/modules/duel/components/PhaseModal'

const meta: Meta<typeof PhaseModal> = {
  title: 'Duel/PhaseModal',
  component: PhaseModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'This is a surface that shows player duel information.',
      },
    },
  },
  args: {
    children: 'This is the modal content',
  },
  tags: ['Stateless'],
}

export default meta

type Story = StoryObj<typeof PhaseModal>

export const Default: Story = {}
