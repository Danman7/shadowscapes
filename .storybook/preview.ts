import type { Preview } from '@storybook/react-vite'
import '../src/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    backgrounds: {
      default: 'background',
      values: [
        {
          name: 'background',
          value: 'var(--color-background)',
        },
        {
          name: 'surface',
          value: 'var(--color-surface)',
        },
      ],
    },

    a11y: {
      test: 'todo',
    },
  },
}

export default preview
