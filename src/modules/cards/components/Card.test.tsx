import { orderCardBases } from 'src/modules/cards/bases/order'
import { Card } from 'src/modules/cards/components/Card'
import type {
  CharacterCardBase,
  InstantCardBase,
} from 'src/modules/cards/types'
import { joinCardCategories } from 'src/modules/cards/utils'
import { render } from 'src/test-utils'

it('displays all UI elements of a character card with on play effect', () => {
  const mockCard = orderCardBases.templeGuard as CharacterCardBase

  const { getByText } = render(<Card card={mockCard} />)

  const { name, cost, strength, onPlayDescription, categories, flavor } =
    mockCard

  expect(getByText(name)).toBeInTheDocument()
  expect(getByText(strength)).toBeInTheDocument()
  expect(getByText(joinCardCategories(categories))).toBeInTheDocument()
  expect(getByText(onPlayDescription as string)).toBeInTheDocument()
  expect(getByText(cost)).toBeInTheDocument()
  expect(getByText(flavor as string)).toBeInTheDocument()
})

it('displays all UI elements of an instant card', () => {
  const mockCard = orderCardBases.yoraSkull as InstantCardBase

  const { getByText, queryByText } = render(<Card card={mockCard} />)

  const { name, cost, onPlayDescription, categories, flavor } = mockCard

  expect(getByText(name)).toBeInTheDocument()
  expect(getByText(joinCardCategories(categories))).toBeInTheDocument()
  expect(getByText(onPlayDescription as string)).toBeInTheDocument()
  expect(getByText(cost)).toBeInTheDocument()
  expect(getByText(flavor as string)).toBeInTheDocument()
  expect(queryByText('0')).not.toBeInTheDocument() // No strength for instant cards
})

it('displays card on discard effect', () => {
  const mockCard = orderCardBases.houseGuard as CharacterCardBase

  const { getByText } = render(<Card card={mockCard} />)

  const { onDiscardDescription } = mockCard

  expect(getByText(onDiscardDescription as string)).toBeInTheDocument()
})
