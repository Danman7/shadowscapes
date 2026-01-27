import '@testing-library/jest-dom'
import '@/test/setup'
import { render } from '@testing-library/react'
import { describe, expect, mock, test } from 'bun:test'

import { Card } from '@/components/Card'
import type { CARD_BASES } from '@/constants/cardBases'
import type { CardInstance } from '@/types'

describe('Card', () => {
  const mockCharacterCard: CardInstance & {
    base: (typeof CARD_BASES)['zombie']
  } = {
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
  }

  const mockInstantCard: CardInstance & {
    base: (typeof CARD_BASES)['bookOfAsh']
  } = {
    id: 2,
    baseId: 'bookOfAsh',
    type: 'instant',
    base: {
      id: 'bookOfAsh',
      name: 'Book of Ash',
      cost: 2,
      description: ['Draw 2 cards.'],
      flavorText: 'Ancient knowledge',
      faction: 'order',
      categories: ['artifact'],
      type: 'instant',
    },
  }

  test('renders character card with all details', () => {
    const { container } = render(<Card card={mockCharacterCard} />)

    expect(container.textContent).toContain('Zombie')
    expect(container.textContent).toContain('1')
    expect(container.textContent).toContain('Character')
    expect(container.textContent).toContain('A shambling undead creature.')
    expect(container.textContent).toContain('Test flavor text')
    expect(container.textContent).toContain('CHAOS')
    expect(container.textContent).toContain('2')
  })

  test('renders instant card without strength', () => {
    const { container } = render(<Card card={mockInstantCard} />)

    expect(container.textContent).toContain('Book of Ash')
    expect(container.textContent).toContain('2')
    expect(container.textContent).toContain('Instant')
    expect(container.textContent).toContain('Draw 2 cards.')
    expect(container.textContent).toContain('ORDER')
  })

  test('calls onClick when clicked', () => {
    const handleClick = mock(() => {})
    const { container } = render(
      <Card card={mockCharacterCard} onClick={handleClick} />,
    )

    const cardElement = container.querySelector(
      '[data-testid="card"]',
    ) as HTMLElement
    cardElement?.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('applies custom className', () => {
    const { container } = render(
      <Card card={mockCharacterCard} className="custom-class" />,
    )

    const cardElement = container.querySelector('[data-testid="card"]')
    expect(cardElement?.className).toContain('custom-class')
  })

  test('applies correct faction colors for chaos', () => {
    const { container } = render(<Card card={mockCharacterCard} />)
    const cardElement = container.querySelector('[data-testid="card"]')

    expect(cardElement?.className).toContain('border-red-500')
  })

  test('applies correct faction colors for order', () => {
    const { container } = render(<Card card={mockInstantCard} />)
    const cardElement = container.querySelector('[data-testid="card"]')

    expect(cardElement?.className).toContain('border-blue-500')
  })
})
