import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect, test } from 'vitest'

import { Board } from '@/components/Board'
import { CARD_BASES } from '@/constants/cardBases'
import { createCardInstance } from '@/game-engine/utils'
import type { CardInstance } from '@/types'

const mockCards: Array<CardInstance & { base: (typeof CARD_BASES)['zombie'] }> =
  [
    {
      ...createCardInstance('zombie'),
      base: CARD_BASES.zombie,
    },
    {
      ...createCardInstance('zombie'),
      base: CARD_BASES.zombie,
    },
  ]

test('renders board with cards', () => {
  const { getByTestId, getAllByTestId } = render(<Board cards={mockCards} />)

  const boardElement = getByTestId('board')
  expect(boardElement).toBeInTheDocument()

  const cardElements = getAllByTestId('card')
  expect(cardElements.length).toBe(2)
})

test('does not display player name when not provided', () => {
  const { container } = render(<Board cards={mockCards} />)

  expect(container.textContent).not.toContain("'s Board")
})
