import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../Button'
import { Modal } from './Modal'

const meta = {
  title: 'Shared/Modal',
  component: Modal,
  args: {
    title: 'Choose a card',
    children: (
      <div className="flex flex-col gap-3">
        <p>The old paper surface carries modal content.</p>
        <Button label="Confirm" onClick={() => undefined} />
      </div>
    ),
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

export const RequiredChoice: Story = {}

export const Cancelable: Story = {
  args: {
    onCancel: () => undefined,
  },
}
