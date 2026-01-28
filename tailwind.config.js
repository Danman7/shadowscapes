/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        'foreground-dim': 'var(--color-foreground-dim)',
        surface: 'var(--color-surface)',
        'surface-dim': 'var(--color-surface-dim)',
        'order-surface': 'var(--color-order-surface)',
        'order-text': 'var(--color-order-text)',
      },
      fontFamily: {
        serif: ['Noto Serif', 'serif'],
      },
    },
  },
  plugins: [],
}
