import '@/test/setup'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect, test } from 'bun:test'

import { DeckPile } from '@/components/DeckPile'

test('renders deck pile with cards', () => {
  const { container } = render(<DeckPile count={30} />)

  const deckPile = container.querySelector('[data-testid="deck-pile"]')
  expect(deckPile).toBeInTheDocument()

  const countBadge = container.querySelector('[data-testid="deck-count"]')
  expect(countBadge).toBeInTheDocument()
  expect(countBadge?.textContent).toBe('30')
})

test('renders empty deck pile when count is 0', () => {
  const { container } = render(<DeckPile count={0} />)

  const emptyMessage = container.querySelector('[data-testid="deck-empty"]')
  expect(emptyMessage).toBeInTheDocument()
  expect(emptyMessage?.textContent).toContain('Empty')
})

test('displays default label "Deck"', () => {
  const { container } = render(<DeckPile count={20} />)

  expect(container.textContent).toContain('Deck')
})

test('displays custom label when provided', () => {
  const { container } = render(<DeckPile count={20} label="Draw Pile" />)

  expect(container.textContent).toContain('Draw Pile')
})

test('does not display label when empty string provided', () => {
  const { container } = render(<DeckPile count={20} label="" />)

  const labels = container.querySelectorAll('.font-semibold')
  expect(labels.length).toBe(0)
})

test('renders CardBack when deck has cards', () => {
  const { container } = render(<DeckPile count={1} />)

  // CardBack has specific styling classes
  const cardBack = container.querySelector('.rounded-lg')
  expect(cardBack).toBeInTheDocument()
})

test('shows correct count badge value', () => {
  const { container } = render(<DeckPile count={15} />)

  const countBadge = container.querySelector('[data-testid="deck-count"]')
  expect(countBadge?.textContent).toBe('15')
})

test('hides count badge when deck is empty', () => {
  const { container } = render(<DeckPile count={0} />)

  const countBadge = container.querySelector('[data-testid="deck-count"]')
  expect(countBadge).not.toBeInTheDocument()
})
