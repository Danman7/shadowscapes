import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { Board } from 'src/components'
import type { CardInstance } from 'src/game-engine'
import { createCardInstance } from 'src/game-engine'

const mockCards: CardInstance[] = [
  createCardInstance('zombie'),
  createCardInstance('haunt'),
]

test('renders board with cards', () => {
  const { getByTestId, getAllByTestId, getByText } = render(
    <Board cards={mockCards} />,
  )

  expect(getByTestId('board')).toBeInTheDocument()
  expect(getAllByTestId('card')).toHaveLength(2)
  expect(getByText('Zombie')).toBeInTheDocument()
  expect(getByText('Haunt')).toBeInTheDocument()
})
