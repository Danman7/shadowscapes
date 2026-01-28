import { render } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { Card, type GameCard } from '@/components/Card'
import { createMockCard } from '@/test/mocks/testHelpers'

let mockCharacterCard: GameCard
let mockInstantCard: GameCard

beforeEach(() => {
  mockCharacterCard = createMockCard('sachelman')

  mockInstantCard = createMockCard('bookOfAsh')
})

afterEach(() => {
  mockCharacterCard = null as unknown as GameCard
  mockInstantCard = null as unknown as GameCard
})

test('renders character card with all details', () => {
  const { getByText } = render(<Card card={mockCharacterCard} />)

  expect(getByText(mockCharacterCard.base.name)).toBeInTheDocument()
  expect(getByText(mockCharacterCard.base.cost)).toBeInTheDocument()
  expect(
    getByText(mockCharacterCard.base.categories.join(' ')),
  ).toBeInTheDocument()
  expect(getByText(mockCharacterCard.strength as number)).toBeInTheDocument()
})

test('renders instant card without strength', () => {
  const { getByText } = render(<Card card={mockInstantCard} />)

  expect(getByText(mockInstantCard.base.name)).toBeInTheDocument()
  expect(getByText(mockInstantCard.base.cost)).toBeInTheDocument()
  expect(getByText(mockInstantCard.base.description[0]!)).toBeInTheDocument()
})

test('calls onClick when clicked', () => {
  const handleClick = vi.fn()
  const { getByTestId } = render(
    <Card card={mockCharacterCard} onClick={handleClick} />,
  )

  const cardElement = getByTestId('card')
  cardElement?.click()

  expect(handleClick).toHaveBeenCalledTimes(1)
})

test('applies correct faction colors for order', () => {
  const { getByTestId } = render(<Card card={mockCharacterCard} />)
  const headerElement = getByTestId('card-header')

  expect(headerElement?.className).toContain('bg-order')
})

test('applies correct faction colors for chaos', () => {
  const { getByTestId } = render(<Card card={mockInstantCard} />)
  const headerElement = getByTestId('card-header')

  expect(headerElement?.className).toContain('bg-chaos')
})

test('applies correct faction colors for shadow', () => {
  const { getByTestId } = render(<Card card={createMockCard('downwinder')} />)
  const headerElement = getByTestId('card-header')

  expect(headerElement?.className).toContain('bg-shadow')
})

test('applies bg-elite class for elite cards', () => {
  const { getByText } = render(<Card card={mockInstantCard} />)
  const categoriesElement = getByText(mockInstantCard.base.categories.join(' '))

  expect(categoriesElement?.className).toContain('bg-elite')
})
