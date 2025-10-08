import type { Preview } from '@storybook/nextjs'
import { Noto_Serif } from 'next/font/google'
import '../app/globals.css'

const notoSerif = Noto_Serif({
  variable: '--font-noto-serif',
  subsets: ['latin'],
})

const preview: Preview = {
  decorators: [
    (Story) => (
      <body className={`${notoSerif.variable} antialiased`}>
        <Story />
      </body>
    ),
  ],
}

export default preview
