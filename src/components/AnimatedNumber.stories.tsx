import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { AnimatedNumber, Button } from 'src/components'

const meta: Meta<typeof AnimatedNumber> = {
  title: 'Common/AnimatedNumber',
  component: AnimatedNumber,
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 12,
  },
}

export default meta
type Story = StoryObj<typeof AnimatedNumber>

const InteractiveCounter: React.FC = () => {
  const [value, setValue] = useState(12)

  return (
    <div className="box p-4 flex-list">
      <span className="coin">
        <AnimatedNumber value={value} />
      </span>

      <div className="flex-list">
        <Button
          isSecondary
          onClick={() =>
            setValue((currentValue) => Math.max(0, currentValue - 3))
          }
        >
          Spend 3
        </Button>

        <Button onClick={() => setValue((currentValue) => currentValue + 3)}>
          Gain 3
        </Button>
      </div>
    </div>
  )
}

export const Default: Story = {}

export const Interactive: Story = {
  render: () => <InteractiveCounter />,
}

export const LargeValue: Story = {
  args: {
    value: 120,
  },
}
