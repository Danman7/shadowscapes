import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    spacing: number
    transitionTime: number
    card: { width: number; height: number }
    colors: {
      primary: string
      background: string
      text: string
      elite: string
      faction: {
        order: string
        chaos: string
        shadow: string
      }
    }
    boxShadow: { level1: string; level2: string; level3: string }
  }
}
