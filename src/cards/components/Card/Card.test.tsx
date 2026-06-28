import { render, screen, within } from '@testing-library/react'

import { Card } from './Card'
import { cardBases } from '../../bases'

const getStatValue = (container: HTMLElement, label: string) => {
  const term = within(container).getByText(label)
  const value = term.nextElementSibling

  expect(value).toBeInstanceOf(HTMLElement)

  return value as HTMLElement
}

test('renders a character card', () => {
  const card = cardBases['templeGuard']

  render(<Card card={card} />)

  const cardElement = screen.getByRole('article', {
    name: `${card.name} card`,
  })

  expect(getStatValue(cardElement, 'Cost')).toHaveTextContent(String(card.cost))
  expect(getStatValue(cardElement, 'Life')).toHaveTextContent(String(card.life))
})
