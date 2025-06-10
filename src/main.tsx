import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from 'src/App'
import { Providers } from 'src/Providers'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
