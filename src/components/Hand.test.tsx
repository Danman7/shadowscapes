import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { Hand } from '@/components/Hand'
import { createCardInstance } from '@/test/mocks/cardInstances'

describe('Hand', () => {
  const mockCards = [
    createCardInstance(1, 'zombie', 2),
    createCardInstance(2, 'bookOfAsh'),
  ]

  test('renders active hand with visible cards', () => {
    const { container } = render(<Hand cards={mockCards} isActive={true} />)

    expect(screen.getByText('Zombie')).toBeTruthy()
    expect(screen.getByText('Book of Ash')).toBeTruthy()
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders inactive hand with card backs', () => {
    const { container } = render(<Hand cards={mockCards} isActive={false} />)

    const cardBacks = screen.getAllByTestId('card-back')
    expect(cardBacks.length).toBe(2)
    expect(screen.queryByText('Zombie')).toBeNull()
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders empty hand message when no cards', () => {
    render(<Hand cards={[]} isActive={true} />)

    expect(screen.getByTestId('hand-empty')).toBeTruthy()
    expect(screen.getByText('Empty Hand')).toBeTruthy()
  })

  test('handles card click for active hand', () => {
    let clickedCardId = -1
    const handleClick = (cardId: number) => {
      clickedCardId = cardId
    }

    render(<Hand cards={mockCards} isActive={true} onCardClick={handleClick} />)

    const firstCard = screen.getAllByTestId('card')[0]!
    firstCard.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(clickedCardId).toBe(1)
  })
})
