import { fireEvent, render, screen, within } from '@testing-library/react'

import { Card } from './Card'
import { CardBack } from './CardBack'
import { cardBases } from '../../bases'
import { cardsText } from '../../../l10n'
import { joinWithSpace } from '../../../shared/utils'

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

  expect(cardElement).toHaveTextContent(joinWithSpace(card.categories))
  expect(cardElement).toHaveTextContent(cardText.description)
  expect(cardElement).toHaveTextContent(cardText.flavor)
  expect(getStatValue(cardElement, 'Cost')).toHaveTextContent(String(card.cost))
  expect(getStatValue(cardElement, 'Life')).toHaveTextContent(String(card.life))
})

test('renders a character card with charges', () => {
  const card = cardBases['burrick']

  render(<Card card={card} />)

  const cardText = cardsText.cards[card.baseId]

  const cardElement = screen.getByRole('article', {
    name: `${cardText.name} card`,
  })

  expect(getStatValue(cardElement, 'Charges')).toHaveTextContent(
    String(card.charges),
  )
})

test('renders a stunned character card', () => {
  const card = {
    ...cardBases['templeGuard'],
    turnsStunned: 2,
  }

  render(<Card card={card} />)

  const cardElement = screen.getByRole('article', {
    name: `${cardsText.cards[card.baseId].name} card`,
  })

  expect(cardElement).toHaveClass('opacity-70')
  expect(getStatValue(cardElement, 'Stunned')).toHaveTextContent(
    String(card.turnsStunned),
  )
})

test('renders a compact card with its effect and an accessible inspection target', () => {
  const card = cardBases['templeGuard']
  const cardText = cardsText.cards[card.baseId]

  render(<Card card={card} isCompact />)

  const cardElement = screen.getByRole('article', {
    name: `${cardText.name} card`,
  })

  expect(cardElement).toHaveClass('card-compact')
  expect(cardElement).toHaveAttribute('tabindex', '0')
  expect(cardElement).toHaveTextContent(cardText.description)
  expect(cardElement).not.toHaveTextContent(cardText.flavor)
  expect(cardElement).not.toHaveTextContent(joinWithSpace(card.categories))
})

test('makes a card glow and activates it with pointer or keyboard input', () => {
  const onClick = vi.fn()

  render(<Card card={cardBases['novice']} onClick={onClick} />)

  const cardElement = screen.getByRole('button', { name: 'Novice card' })

  expect(cardElement).toHaveClass('card-glow', 'card-glow--primary')
  expect(cardElement).toHaveAttribute('tabindex', '0')

  fireEvent.keyDown(cardElement, { key: 'Escape' })
  expect(onClick).not.toHaveBeenCalled()

  fireEvent.click(cardElement)
  fireEvent.keyDown(cardElement, { key: 'Enter' })
  fireEvent.keyDown(cardElement, { key: ' ' })

  expect(onClick).toHaveBeenCalledTimes(3)
})

test('keeps a card non-interactive when onClick is undefined', () => {
  render(<Card card={cardBases['novice']} />)

  const cardElement = screen.getByRole('article', { name: 'Novice card' })

  fireEvent.keyDown(cardElement, { key: 'Enter' })

  expect(cardElement).not.toHaveClass('card-glow')
  expect(cardElement).not.toHaveAttribute('tabindex')
})

test('renders a card back', () => {
  render(<CardBack />)

  expect(
    screen.getByRole('article', {
      name: 'Card back',
    }),
  ).toBeInTheDocument()
})
