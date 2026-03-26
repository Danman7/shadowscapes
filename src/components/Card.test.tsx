import { render } from '@testing-library/react'

import { Card } from 'src/components'
import type { CardInstance } from 'src/game-engine'
import { CARD_BASES, createCardInstance } from 'src/game-engine'

let mockCharacterCard: CardInstance
let mockInstantCard: CardInstance

beforeEach(() => {
  mockCharacterCard = createCardInstance('sachelman')

  mockInstantCard = createCardInstance('bookOfAsh')
})

afterEach(() => {
  mockCharacterCard = null as unknown as CardInstance
  mockInstantCard = null as unknown as CardInstance
})

test('renders character card with all details', () => {
  const { getByText } = render(<Card card={mockCharacterCard} />)
  const {
    name,
    categories,
    text: { description },
  } = CARD_BASES[mockCharacterCard.base.id]

  expect(getByText(name)).toBeInTheDocument()
  expect(getByText(categories.join(' '))).toBeInTheDocument()
  expect(getByText(mockCharacterCard.attributes.cost)).toBeInTheDocument()
  expect(
    getByText(mockCharacterCard.attributes.life as number),
  ).toBeInTheDocument()
  expect(getByText(description[0]!)).toBeInTheDocument()
})

test('renders instant card without life', () => {
  const { getByText } = render(<Card card={mockInstantCard} />)
  const {
    name,
    text: { description },
    categories,
  } = CARD_BASES[mockInstantCard.base.id]

  expect(getByText(name)).toBeInTheDocument()
  expect(getByText(mockInstantCard.attributes.cost)).toBeInTheDocument()
  expect(getByText(description[0]!)).toBeInTheDocument()

  expect(getByText(categories.join(' '))).toBeInTheDocument()
})

test('renders card with charges', () => {
  const { getAllByText } = render(
    <Card card={createCardInstance('markander')} />,
  )

  expect(
    getAllByText(CARD_BASES.markander.attributes.charges!).length,
  ).toBeGreaterThan(1)
})

test('calls onClick when clicked', () => {
  const handleClick = vi.fn()
  const { getByTestId } = render(
    <Card card={mockCharacterCard} onClick={handleClick} />,
  )

  const cardElement = getByTestId('card')
  cardElement?.click()

  expect(handleClick).toHaveBeenCalledTimes(1)
})
