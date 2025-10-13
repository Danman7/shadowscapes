import type { Preview } from '@storybook/nextjs'
import { Noto_Serif } from 'next/font/google'
import { IconContext } from 'react-icons/lib'

import '@/app/globals.css'

const notoSerif = Noto_Serif({
  variable: '--font-noto-serif',
  subsets: ['latin'],
})

const preview: Preview = {
  decorators: [
    (Story) => (
      <IconContext.Provider
        value={{ style: { verticalAlign: 'middle', marginBottom: '2px' } }}
      >
        <div
          className={`${notoSerif.variable} antialiased font-serif bg-background text-foreground`}
        >
          <Story />
        </div>
      </IconContext.Provider>
    ),
  ],
}

export default preview
