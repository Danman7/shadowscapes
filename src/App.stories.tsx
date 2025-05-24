import type { Meta, StoryObj } from '@storybook/react'
import App from './App'

const meta: Meta<typeof App> = {
  title: 'App',
  component: App,
  parameters: {
    actions: {
      handles: ['click button'],
    },
  },
}

export default meta

export const Default: StoryObj<typeof App> = {
  args: {},
}
