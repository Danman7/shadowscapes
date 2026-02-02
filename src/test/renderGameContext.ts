import { render, type RenderOptions } from '@testing-library/react'
import { createElement, type ReactElement, type ReactNode } from 'react'

import { GameProvider } from '@/contexts/GameContext'
import type { Duel } from '@/types'

interface RenderGameContextOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<Duel>
}

export const renderGameContext = (
  ui: ReactElement,
  { preloadedState, ...renderOptions }: RenderGameContextOptions = {},
) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(GameProvider, { preloadedState, children })
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
