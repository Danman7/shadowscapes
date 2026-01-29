import { createElement, type ReactElement, type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'

import type { CardBaseId, Duel, Phase, Player, PlayerId } from '@/types'
import { CARD_BASES } from '@/constants/cardBases'
import { createCardInstance } from '@/game-engine/utils'
import type { GameCard } from '@/components/Card'
import { GameProvider } from '@/contexts/GameContext'

/**
 * Creates a mock GameCard with card instance and base populated
 */
export function createMockCard<T extends CardBaseId>(baseId: T): GameCard {
  return {
    ...createCardInstance(baseId),
    base: CARD_BASES[baseId],
  }
}

/**
 * Creates a mock Player object with optional overrides
 */
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

/**
 * Creates a mock Duel object with optional overrides
 */
export function createMockDuel(overrides: Partial<Duel> = {}): Duel {
  return {
    cards: {},
    players: {
      player1: createMockPlayer('player1'),
      player2: createMockPlayer('player2'),
    },
    activePlayerId: 'player1',
    inactivePlayerId: 'player2',
    phase: 'intro' as Phase,
    startingPlayerId: null,
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
