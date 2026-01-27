import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/react-vite',
  async viteFinal(viteConfig) {
    const dirname = path.dirname(fileURLToPath(import.meta.url))

    viteConfig.resolve ??= {}
    const alias = (viteConfig.resolve.alias ?? {}) as Record<string, string>
    viteConfig.resolve.alias = {
      ...alias,
      '@': path.resolve(dirname, '../src'),
    }

    return viteConfig
  },
}
export default config
