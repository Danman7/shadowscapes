import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect, test } from 'vitest'

import { Board } from '@/components/Board'
import { createCardInstance } from '@/game-engine/utils'
import type { CardInstance } from '@/types'

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
