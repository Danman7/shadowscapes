import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { Hand } from '@/components/Hand'
import { createCardInstance } from '@/game-engine/utils'
import type { CardInstance } from '@/types'

let mockCards: CardInstance[]

beforeEach(() => {
  mockCards = [createCardInstance('zombie'), createCardInstance('zombie')]
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
    <Hand cards={mockCards} />,
  )

  const handElement = getByTestId('hand')
  expect(handElement).toBeInTheDocument()

  expect(() => getByText('Zombie')).toThrow()

  expect(getAllByTestId('card-back')).toHaveLength(2)
})

test('calls onCardClick when card is clicked in active hand', () => {
  const clickHandler = vi.fn()
  const handleCardClick = vi.fn(() => clickHandler)
  const { getAllByTestId } = render(
    <Hand cards={mockCards} isActive={true} onCardClick={handleCardClick} />,
  )

  const firstCard = getAllByTestId('card')[0] as HTMLElement
  firstCard?.click()

  // handleCardClick is called once per card during render
  expect(handleCardClick).toHaveBeenCalledWith(mockCards[0]?.id)
  // The actual click handler should be called once
  expect(clickHandler).toHaveBeenCalledTimes(1)
})

test('does not render clickable cards in inactive hand', () => {
  const handleCardClick = vi.fn(() => vi.fn())
  const { queryAllByTestId } = render(
    <Hand cards={mockCards} onCardClick={handleCardClick} />,
  )

  const cardElements = queryAllByTestId('card')
  expect(cardElements.length).toBe(0)
})

test('applies is-clickable class when onCardClick returns a function', () => {
  const handleCardClick = vi.fn((cardId: number) => {
    if (cardId === mockCards[0]?.id) return vi.fn()
    return undefined
  })

  const { container } = render(
    <Hand cards={mockCards} isActive={true} onCardClick={handleCardClick} />,
  )

  const handCards = container.querySelectorAll('.hand-card')
  expect(handCards[0]).toHaveClass('is-clickable')
  expect(handCards[1]).not.toHaveClass('is-clickable')
})

test('does not apply is-clickable class when onCardClick returns undefined', () => {
  const handleCardClick = vi.fn(() => undefined)
  const { container } = render(
    <Hand cards={mockCards} isActive={true} onCardClick={handleCardClick} />,
  )

  const handCards = container.querySelectorAll('.hand-card')
  handCards.forEach((card) => {
    expect(card).not.toHaveClass('is-clickable')
  })
})

test('does not apply is-clickable class when no onCardClick provided', () => {
  const { container } = render(<Hand cards={mockCards} isActive={true} />)

  const handCards = container.querySelectorAll('.hand-card')
  handCards.forEach((card) => {
    expect(card).not.toHaveClass('is-clickable')
  })
})
