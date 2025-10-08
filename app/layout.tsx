import type { Metadata } from 'next'
import { Noto_Serif } from 'next/font/google'
import './globals.css'

const notoSerif = Noto_Serif({
  variable: '--font-noto-serif',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Shadowscapes',
  description: 'A card game inspired by the Thief game series.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${notoSerif.variable} antialiased`}>{children}</body>
    </html>
  )
}
