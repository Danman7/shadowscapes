import { render as rtlRender, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PropsWithChildren, ReactElement } from 'react'

import { DuelProvider } from 'src/modules/duel/components/DuelProvider'
import { DuelState } from 'src/modules/duel/types'
import { UserProvider } from 'src/modules/user/components/UserProvider'
import { UserState } from 'src/modules/user/types'
import { Providers } from 'src/Providers'

interface RenderStateOptions {
  preloadedUser?: UserState
  preloadedDuel?: DuelState
}

export const render = (
  ui: ReactElement,
  { preloadedUser, preloadedDuel }: RenderStateOptions = {},
) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <Providers>
      <UserProvider preloadedState={preloadedUser}>
        <DuelProvider preloadedState={preloadedDuel}>{children}</DuelProvider>
      </UserProvider>
    </Providers>
  )

  return { ...rtlRender(ui, { wrapper: Wrapper }), userEvent, waitFor }
}

export type RenderResult = ReturnType<typeof render>
