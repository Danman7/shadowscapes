import { orderCardBases } from 'src/modules/cards/bases/order'
import { Card } from 'src/modules/cards/components/Card'
import type { CharacterCardBase } from 'src/modules/cards/types'
import { joinCardCategories } from 'src/modules/cards/utils'
import { render } from 'src/test-utils'

const mockCard = orderCardBases.templeGuard as CharacterCardBase

describe('Card', () => {
  it('displays all UI elements of a character card', () => {
    const { getByText } = render(<Card card={mockCard} />)

    const { name, cost, strength, onPlayDescription, categories } = mockCard

    expect(getByText(name)).toBeInTheDocument()
    expect(getByText(strength)).toBeInTheDocument()
    expect(getByText(joinCardCategories(categories))).toBeInTheDocument()
    expect(getByText(onPlayDescription as string)).toBeInTheDocument()
    expect(getByText(cost)).toBeInTheDocument()
  })
})
