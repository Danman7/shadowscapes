import type { Meta, StoryObj } from '@storybook/react'

import { CardBack } from './CardBack'

const meta = {
  title: 'Cards/CardBack',
  component: CardBack,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CardBack>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
