import { render } from '@testing-library/react'

import { Card } from 'src/components'
import { CARD_BASES } from 'src/constants/cardBases'
import { createCardInstance } from 'src/reducers/helpers'
import type { CardBaseCharacter, CardInstance } from 'src/types'

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
  const { name, categories, description } = CARD_BASES[mockCharacterCard.baseId]

  expect(getByText(name)).toBeInTheDocument()
  expect(getByText(categories.join(' '))).toBeInTheDocument()
  expect(getByText(mockCharacterCard.cost)).toBeInTheDocument()
  expect(getByText(mockCharacterCard.life as number)).toBeInTheDocument()
  expect(getByText(description[0]!)).toBeInTheDocument()
})

test('renders instant card without life', () => {
  const { getByText } = render(<Card card={mockInstantCard} />)
  const { name, description, categories } = CARD_BASES[mockInstantCard.baseId]

  expect(getByText(name)).toBeInTheDocument()
  expect(getByText(mockInstantCard.cost)).toBeInTheDocument()
  expect(getByText(description[0]!)).toBeInTheDocument()

  expect(getByText(categories.join(' '))).toBeInTheDocument()
})

test('renders card with charges', () => {
  const { getAllByText } = render(
    <Card card={createCardInstance('markander')} />,
  )

  expect(
    getAllByText((CARD_BASES.markander as CardBaseCharacter).charges!).length,
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
