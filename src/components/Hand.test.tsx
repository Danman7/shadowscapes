import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { afterEach, beforeEach, expect, mock, test } from 'bun:test'

import type { GameCard } from '@/components/Card'
import { Hand } from '@/components/Hand'
import { createMockCard } from '@/test/mocks/testHelpers'

let mockCards: GameCard[]

beforeEach(() => {
  mockCards = [createMockCard('zombie'), createMockCard('zombie')]
})

afterEach(() => {
  mockCards = []
})

test('renders active hand with cards', () => {
  const { getByTestId, getAllByTestId, getAllByText } = render(
    <Hand cards={mockCards} isActive={true} />,
  )

  const handElement = getByTestId('hand')
  expect(handElement).toBeInTheDocument()

  const cardElements = getAllByTestId('card')
  expect(cardElements.length).toBe(2)
  expect(getAllByText('Zombie')).toHaveLength(2)
})

test('renders inactive hand with card backs', () => {
  const { getByTestId, getAllByTestId, getByText } = render(
    <Hand cards={mockCards} isActive={false} />,
  )

  const handElement = getByTestId('hand')
  expect(handElement).toBeInTheDocument()

  expect(() => getByText('Zombie')).toThrow()

  expect(getAllByTestId('card-back')).toHaveLength(2)
})

test('renders empty hand message when no cards', () => {
  const { getByTestId } = render(<Hand cards={[]} isActive={true} />)

  const emptyMessage = getByTestId('hand-empty')
  expect(emptyMessage).toBeInTheDocument()
  expect(emptyMessage?.textContent).toContain('Empty Hand')
})

test('calls onCardClick when card is clicked in active hand', () => {
  const handleCardClick = mock(() => {})
  const { getAllByTestId } = render(
    <Hand cards={mockCards} isActive={true} onCardClick={handleCardClick} />,
  )

  const firstCard = getAllByTestId('card')[0] as HTMLElement
  firstCard?.click()

  expect(handleCardClick).toHaveBeenCalledTimes(1)
  expect(handleCardClick).toHaveBeenCalledWith(mockCards[0]?.id)
})

test('does not render clickable cards in inactive hand', () => {
  const handleCardClick = mock(() => {})
  const { queryAllByTestId } = render(
    <Hand cards={mockCards} isActive={false} onCardClick={handleCardClick} />,
  )

  const cardElements = queryAllByTestId('card')
  expect(cardElements.length).toBe(0)
})
