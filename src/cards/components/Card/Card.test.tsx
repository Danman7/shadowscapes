import { render, screen, within } from '@testing-library/react'

import { Card } from './Card'
import { CardBack } from './CardBack'
import { cardBases } from '../../bases'
import { cardsText } from '../../../l10n'

const getStatValue = (container: HTMLElement, label: string) => {
  const term = within(container).getByText(label)
  const value = term.nextElementSibling

  expect(value).toBeInstanceOf(HTMLElement)

  return value as HTMLElement
}

test('renders a character card', () => {
  const card = cardBases['templeGuard']

  render(<Card card={card} />)

  const cardText = cardsText.cards[card.baseId]

  const cardElement = screen.getByRole('article', {
    name: `${cardText.name} card`,
  })

  expect(cardElement).toHaveTextContent('Gain 1 life')
  expect(getStatValue(cardElement, 'Cost')).toHaveTextContent(String(card.cost))
  expect(getStatValue(cardElement, 'Life')).toHaveTextContent(String(card.life))
})

test('renders a card back', () => {
  render(<CardBack />)

  expect(
    screen.getByRole('article', {
      name: 'Card back',
    }),
  ).toBeInTheDocument()
})
