import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import { Card } from './Card'
import { cardBases } from '../../bases'

test('renders a character card', () => {
  const card = cardBases['templeGuard']
  render(<Card card={card} />)

  expect(
    screen.getByRole('article', { name: `${card.name} card` }),
  ).toBeInTheDocument()
  expect(screen.getByText(card.name)).toBeInTheDocument()
  expect(screen.getByText(card.cost)).toBeInTheDocument()
})
