import '@/test/setup'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect, mock, test } from 'bun:test'

import { Card } from '@/components/Card'
import { CARD_BASES } from '@/constants/cardBases'
import { createCardInstance } from '@/game-engine/utils'

const mockCharacterCard = {
  ...createCardInstance('zombie'),
  base: CARD_BASES.zombie,
}

const mockInstantCard = {
  ...createCardInstance('bookOfAsh'),
  base: CARD_BASES.bookOfAsh,
}

test('renders character card with all details', () => {
  const { container } = render(<Card card={mockCharacterCard} />)

  expect(container.textContent).toContain(mockCharacterCard.base.name)
  expect(container.textContent).toContain(
    mockCharacterCard.base.cost.toString(),
  )

  expect(container.textContent).toContain(
    mockCharacterCard.base.description[0]!,
  )

  expect(container.textContent).toContain(
    mockCharacterCard.strength?.toString()!,
  )
})

test('renders instant card without strength', () => {
  const { container } = render(<Card card={mockInstantCard} />)

  expect(container.textContent).toContain(mockInstantCard.base.name)
  expect(container.textContent).toContain(mockInstantCard.base.cost.toString())
  expect(container.textContent).toContain(mockInstantCard.base.description[0]!)
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
  const headerElement = container.querySelector('[data-testid="card-header"]')

  expect(headerElement?.className).toContain('bg-chaos')
})

test('applies bg-elite class for elite character cards', () => {
  const { container } = render(<Card card={mockCharacterCard} />)
  const categoriesElement = container.querySelector(
    '[data-testid="card-header"] + div',
  )

  if (mockCharacterCard.base.rank === 'elite') {
    expect(categoriesElement?.className).toContain('bg-elite')
  } else {
    expect(categoriesElement?.className).toContain('bg-foreground-dim')
  }
})

test('applies correct rank styling for elite instant cards', () => {
  const { container } = render(<Card card={mockInstantCard} />)
  const categoriesElement = container.querySelector(
    '[data-testid="card-header"] + div',
  )

  if (mockInstantCard.base.rank === 'elite') {
    expect(categoriesElement?.className).toContain('bg-elite')
  } else {
    expect(categoriesElement?.className).toContain('bg-foreground-dim')
  }
})
