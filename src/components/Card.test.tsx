import { render } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { Card } from '@/components/Card'
import { CARD_BASES } from '@/constants/cardBases'
import { FACTION_COLORS } from '@/constants/duelParams'
import { createCardInstance } from '@/game-engine/utils'
import type { CardInstance } from '@/types'

let mockCharacterCard: CardInstance
let mockInstantCard: CardInstance

beforeEach(() => {
  mockCharacterCard = createCardInstance('sachelman')

  mockInstantCard = createCardInstance('bookOfAsh')
})

afterEach(() => {
  mockCharacterCard = null as unknown as CardInstance
  mockInstantCard = null as unknown as CardInstance
})

test('renders character card with all details', () => {
  const { getByText } = render(<Card card={mockCharacterCard} />)
  const { name, cost, categories, description, flavorText } =
    CARD_BASES[mockCharacterCard.baseId]

  expect(getByText(name)).toBeInTheDocument()
  expect(getByText(cost)).toBeInTheDocument()
  expect(getByText(categories.join(' '))).toBeInTheDocument()
  expect(getByText(mockCharacterCard.strength as number)).toBeInTheDocument()
  expect(getByText(description[0]!)).toBeInTheDocument()
  expect(getByText(flavorText!)).toBeInTheDocument()
})

test('renders instant card without strength', () => {
  const { getByText } = render(<Card card={mockInstantCard} />)
  const { name, cost, description, flavorText, categories } =
    CARD_BASES[mockInstantCard.baseId]

  expect(getByText(name)).toBeInTheDocument()
  expect(getByText(cost)).toBeInTheDocument()
  expect(getByText(description[0]!)).toBeInTheDocument()
  expect(getByText(flavorText!)).toBeInTheDocument()
  expect(getByText(categories.join(' '))).toBeInTheDocument()
})

test('renders card with counter', () => {
  const { getByText } = render(
    <Card card={createCardInstance('highPriestMarkander')} />,
  )

  expect(getByText(CARD_BASES.highPriestMarkander.counter!)).toBeInTheDocument()
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

  expect(headerElement?.className).toContain(FACTION_COLORS.order)
})

test('applies correct faction colors for chaos', () => {
  const { getByTestId } = render(<Card card={mockInstantCard} />)
  const headerElement = getByTestId('card-header')

  expect(headerElement?.className).toContain(FACTION_COLORS.chaos)
})

test('applies correct faction colors for shadow', () => {
  const { getByTestId } = render(
    <Card card={createCardInstance('downwinder')} />,
  )
  const headerElement = getByTestId('card-header')

  expect(headerElement?.className).toContain(FACTION_COLORS.shadow)
})

test('applies bg-elite class for elite cards', () => {
  const { getByText } = render(<Card card={mockInstantCard} />)
  const { categories } = CARD_BASES[mockInstantCard.baseId]

  const categoriesElement = getByText(categories.join(' '))

  expect(categoriesElement?.className).toContain('bg-primary')
})
