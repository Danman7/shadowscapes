import { render, type RenderOptions } from '@testing-library/react'
import { createElement, type ReactElement, type ReactNode } from 'react'

import { GameProvider } from '@/contexts/GameContext'
import type { Duel, Player, PlayerId } from '@/types'

export function createMockPlayer(
  id: PlayerId,
  overrides: Partial<Player> = {},
): Player {
  return {
    id,
    name: id === 'player1' ? 'Test Player 1' : 'Test Player 2',
    coins: 0,
    deckIds: [],
    handIds: [],
    boardIds: [],
    discardIds: [],
    ...overrides,
  }
}

interface RenderGameContextOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<Duel>
}

/**
 * Custom render that wraps components in GameProvider
 * and allows preloaded duel state overrides.
 */
export function renderGameContext(
  ui: ReactElement,
  { preloadedState, ...renderOptions }: RenderGameContextOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(GameProvider, { preloadedState, children })
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
