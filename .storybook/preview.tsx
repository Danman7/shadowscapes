import type { Preview } from '@storybook/react'

import { Providers } from '../src/Providers'
import { theme } from '../src/theme'

const preview: Preview = {
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    backgrounds: {
      default: 'default',
      values: [{ name: 'default', value: theme.colors.background }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
}

export default preview
