import '@/test/setup'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect, test } from 'bun:test'

import { Board } from '@/components/Board'
import { CARD_BASES } from '@/constants/cardBases'
import { createCardInstance } from '@/game-engine/utils'
import type { CardInstance } from '@/types'

const mockCards: Array<CardInstance & { base: (typeof CARD_BASES)['zombie'] }> =
  [
    {
      ...createCardInstance('zombie'),
      base: CARD_BASES.zombie,
    },
    {
      ...createCardInstance('zombie'),
      base: CARD_BASES.zombie,
    },
  ]

test('renders board with cards', () => {
  const { container } = render(<Board cards={mockCards} />)

  const boardElement = container.querySelector('[data-testid="board"]')
  expect(boardElement).toBeInTheDocument()

  const cardElements = container.querySelectorAll('[data-testid="card"]')
  expect(cardElements.length).toBe(2)
})

test('renders empty board message when no cards', () => {
  const { container } = render(<Board cards={[]} />)

  const emptyMessage = container.querySelector('[data-testid="board-empty"]')
  expect(emptyMessage).toBeInTheDocument()
  expect(emptyMessage?.textContent).toContain('No cards on board')
})

test('displays player name when provided', () => {
  const { container } = render(<Board cards={mockCards} playerName="Alice" />)

  expect(container.textContent).toContain("Alice's Board")
})

test('does not display player name when not provided', () => {
  const { container } = render(<Board cards={mockCards} />)

  expect(container.textContent).not.toContain("'s Board")
})
