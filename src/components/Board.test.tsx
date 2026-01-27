import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { Board } from '@/components/Board'
import { createCardInstance } from '@/test/mocks/cardInstances'

describe('Board', () => {
  const mockCards = [
    createCardInstance(1, 'zombie', 2),
    createCardInstance(2, 'templeGuard', 3),
  ]

  test('renders board with cards', () => {
    const { container } = render(<Board cards={mockCards} />)

    expect(screen.getByText('Zombie')).toBeTruthy()
    expect(screen.getByText('Temple Guard')).toBeTruthy()
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders board with player name label', () => {
    render(<Board cards={mockCards} playerName="Player 1" />)

    expect(screen.getByText("Player 1's Board")).toBeTruthy()
  })

  test('renders empty board message', () => {
    render(<Board cards={[]} />)

    expect(screen.getByTestId('board-empty')).toBeTruthy()
    expect(screen.getByText('No cards on board')).toBeTruthy()
  })
})
