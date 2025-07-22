import { action } from '@storybook/addon-actions'
import type { Meta, StoryObj } from '@storybook/react'
import { GiFist } from 'react-icons/gi'

import { Button } from 'src/components/Button'

const meta: Meta<typeof Button> = {
  title: 'Shared/Button',
  component: Button,
  args: {
    children: 'Skip Redraw',
    onClick: action('button-clicked'),
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <GiFist /> Skip Redraw
      </>
    ),
  },
}

export const IconOnly: Story = {
  args: {
    children: <GiFist />,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    onClick: undefined,
  },
}
