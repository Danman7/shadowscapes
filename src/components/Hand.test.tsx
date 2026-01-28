import '@/test/setup'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect, mock, test } from 'bun:test'

import { Hand } from '@/components/Hand'
import { CARD_BASES } from '@/constants/cardBases'
import { createCardInstance } from '@/game-engine/utils'

const mockCards = [
  {
    ...createCardInstance('zombie'),
    base: CARD_BASES.zombie,
  },
  {
    ...createCardInstance('zombie'),
    base: CARD_BASES.zombie,
  },
]

test('renders active hand with cards', () => {
  const { container } = render(<Hand cards={mockCards} isActive={true} />)

  const handElement = container.querySelector('[data-testid="hand"]')
  expect(handElement).toBeInTheDocument()

  const cardElements = container.querySelectorAll('[data-testid="card"]')
  expect(cardElements.length).toBe(2)
  expect(container.textContent).toContain('Zombie')
})

test('renders inactive hand with card backs', () => {
  const { container } = render(<Hand cards={mockCards} isActive={false} />)

  const handElement = container.querySelector('[data-testid="hand"]')
  expect(handElement).toBeInTheDocument()

  // Should not show actual card content
  expect(container.textContent).not.toContain('Zombie')

  // Should render CardBacks (which have rounded-lg class)
  const cardBacks = container.querySelectorAll('.rounded-lg')
  expect(cardBacks.length).toBe(2)
})

test('renders empty hand message when no cards', () => {
  const { container } = render(<Hand cards={[]} isActive={true} />)

  const emptyMessage = container.querySelector('[data-testid="hand-empty"]')
  expect(emptyMessage).toBeInTheDocument()
  expect(emptyMessage?.textContent).toContain('Empty Hand')
})

test('calls onCardClick when card is clicked in active hand', () => {
  const handleCardClick = mock(() => {})
  const { container } = render(
    <Hand cards={mockCards} isActive={true} onCardClick={handleCardClick} />,
  )

  const firstCard = container.querySelector(
    '[data-testid="card"]',
  ) as HTMLElement
  firstCard?.click()

  expect(handleCardClick).toHaveBeenCalledTimes(1)
  expect(handleCardClick).toHaveBeenCalledWith(mockCards[0]?.id)
})

test('does not render clickable cards in inactive hand', () => {
  const handleCardClick = mock(() => {})
  const { container } = render(
    <Hand cards={mockCards} isActive={false} onCardClick={handleCardClick} />,
  )

  // No card elements should be present in inactive hand
  const cardElements = container.querySelectorAll('[data-testid="card"]')
  expect(cardElements.length).toBe(0)
})

test('handles missing onCardClick gracefully', () => {
  const { container } = render(<Hand cards={mockCards} isActive={true} />)

  const firstCard = container.querySelector(
    '[data-testid="card"]',
  ) as HTMLElement
  expect(() => firstCard?.click()).not.toThrow()
})
