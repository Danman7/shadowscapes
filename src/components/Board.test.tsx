import '@testing-library/jest-dom'
import '@/test/setup'
import { render } from '@testing-library/react'
import { describe, expect, test } from 'bun:test'

import { Board } from '@/components/Board'
import type { CARD_BASES } from '@/constants/cardBases'
import type { CardInstance } from '@/types'

describe('Board', () => {
  const mockCards: Array<
    CardInstance & { base: (typeof CARD_BASES)['zombie'] }
  > = [
    {
      id: 1,
      baseId: 'zombie',
      type: 'character',
      strength: 2,
      base: {
        id: 'zombie',
        name: 'Zombie',
        cost: 1,
        description: ['A shambling undead creature.'],
        flavorText: 'Test flavor text',
        faction: 'chaos',
        categories: ['undead'],
        type: 'character',
        strength: 2,
      },
    },
    {
      id: 2,
      baseId: 'zombie',
      type: 'character',
      strength: 1,
      base: {
        id: 'zombie',
        name: 'Zombie',
        cost: 1,
        description: ['A shambling undead creature.'],
        flavorText: 'Test flavor text',
        faction: 'chaos',
        categories: ['undead'],
        type: 'character',
        strength: 1,
      },
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
})
