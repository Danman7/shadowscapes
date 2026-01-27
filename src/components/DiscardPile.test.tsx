import '@/test/setup'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect, test } from 'bun:test'

import { DiscardPile } from '@/components/DiscardPile'

test('renders discard pile with cards', () => {
  const { container } = render(<DiscardPile count={5} />)

  const discardPile = container.querySelector('[data-testid="discard-pile"]')
  expect(discardPile).toBeInTheDocument()

  const countBadge = container.querySelector('[data-testid="discard-count"]')
  expect(countBadge).toBeInTheDocument()
  expect(countBadge?.textContent).toBe('5')
})

test('renders empty discard pile when count is 0', () => {
  const { container } = render(<DiscardPile count={0} />)

  const emptyMessage = container.querySelector('[data-testid="discard-empty"]')
  expect(emptyMessage).toBeInTheDocument()
  expect(emptyMessage?.textContent).toContain('Empty')
})

test('displays default label', () => {
  const { container } = render(<DiscardPile count={3} />)

  expect(container.textContent).toContain('Discard')
})

test('displays custom label when provided', () => {
  const { container } = render(<DiscardPile count={3} label="Graveyard" />)

  expect(container.textContent).toContain('Graveyard')
  expect(container.textContent).not.toContain('Discard')
})

test('does not display label when empty string provided', () => {
  const { container } = render(<DiscardPile count={3} label="" />)

  const labels = container.querySelectorAll('.font-semibold')
  expect(labels.length).toBe(0)
})

test('renders CardBack when count > 0', () => {
  const { container } = render(<DiscardPile count={1} />)

  // CardBack has a specific structure/classes
  const cardBack = container.querySelector('.rounded-lg')
  expect(cardBack).toBeInTheDocument()
})
