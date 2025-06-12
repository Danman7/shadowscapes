import type { ReactNode } from 'react'
import { IconContext } from 'react-icons'
import { ThemeProvider } from 'styled-components'

import { GlobalStyle } from 'src/GlobalStyle'
import { theme } from 'src/theme'

interface ProvidersProps {
  children: ReactNode
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <IconContext.Provider
      value={{ style: { verticalAlign: 'middle', marginBottom: '2px' } }}
    >
      <GlobalStyle />
      {children}
    </IconContext.Provider>
  </ThemeProvider>
)
