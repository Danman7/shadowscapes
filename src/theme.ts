import type { DefaultTheme } from 'styled-components'

export const theme: DefaultTheme = {
  spacing: 8,
  transitionTime: 200, // in milliseconds
  card: { width: 250, height: 350 },
  colors: {
    primary: '#dc2626',
    active: '#22c55e',
    text: '#27272a',
    elite: '#854d0e',
    background: '#fafafa',
    surface: '#f4f4f5',
    hidden: '#e4e4e7',
    border: '#d4d4d8',
    faction: {
      order: '#7f1d1d',
      chaos: '#14532d',
      shadow: '#312e81',
    },
  },
  boxShadow: {
    level1:
      '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
    level2:
      '0px 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px 0px rgba(0, 0, 0, 0.14), 0px 1px 8px 0px rgba(0, 0, 0, 0.12)',
    level3:
      '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 5px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 14px 0px rgba(0, 0, 0, 0.12)',
  },
}
