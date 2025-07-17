import type { Meta, StoryObj } from '@storybook/react'
import { GiBlackHandShield, GiFist, GiSemiClosedEye } from 'react-icons/gi'

import { Button } from 'src/components/Button'

const meta: Meta<typeof Button> = {
  title: 'Shared/Button',
  component: Button,
  args: {
    message: 'Skip Redraw',
  },
  argTypes: {
    icon: {
      control: 'select',
      options: ['undefined', 'GiFist', 'GiSemiClosedEye', 'GiBlackHandShield'],
      mapping: {
        undefined: undefined,
        GiFist: <GiFist />,
        GiSemiClosedEye: <GiSemiClosedEye />,
        GiBlackHandShield: <GiBlackHandShield />,
      },
      description: 'Icon to display in the button',
    },
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {}

export const WithIcon: Story = {
  args: {
    icon: <GiFist />,
  },
}

export const IconOnly: Story = {
  args: {
    message: undefined,
    icon: <GiFist />,
  },
}
