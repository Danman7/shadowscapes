import type { Meta, StoryObj } from '@storybook/react'

import { FaceDownStack } from './FaceDownStack'

const meta = {
  title: 'Duel/FaceDownStack',
  component: FaceDownStack,
  parameters: {
    layout: 'centered',
  },
  args: {
    label: 'Deck',
    amount: 10,
  },
} satisfies Meta<typeof FaceDownStack>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
