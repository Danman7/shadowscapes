import { GlobalStyle } from 'src/GlobalStyle'
import type { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from 'src/theme'

interface ProvidersProps {
  children: ReactNode
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    {children}
  </ThemeProvider>
)
