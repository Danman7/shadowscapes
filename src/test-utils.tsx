import { fireEvent, render as rtlRender, waitFor } from '@testing-library/react'
import type { PropsWithChildren, ReactElement } from 'react'

import { Providers } from 'src/Providers'

export const render = (ui: ReactElement) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <Providers>{children}</Providers>
  )

  return { ...rtlRender(ui, { wrapper: Wrapper }), fireEvent, waitFor }
}
