import { messages } from 'src/i18n/indext'
import { allCardBases } from 'src/modules/cards/bases'
import { Card } from 'src/modules/cards/components/Card'
import type {
  CharacterCardBase,
  InstantCardBase,
} from 'src/modules/cards/types'
import { joinCardCategories } from 'src/modules/cards/utils'
import { render } from 'src/test-utils'

describe('Card Component', () => {
  describe('Base UI Elements', () => {
    it('displays all base UI elements of a character card', () => {
      const mockCard = allCardBases.templeGuard as CharacterCardBase

      const { getByText } = render(<Card card={mockCard} />)

      const { name, cost, strength, categories, flavor } = mockCard

      expect(getByText(name)).toBeInTheDocument()
      expect(getByText(strength)).toBeInTheDocument()
      expect(getByText(joinCardCategories(categories))).toBeInTheDocument()
      expect(getByText(cost)).toBeInTheDocument()
      expect(getByText(flavor as string)).toBeInTheDocument()
    })

    it('displays all base UI elements of an instant card', () => {
      const mockCard = allCardBases.yoraSkull as InstantCardBase

      const { getByText, queryByText } = render(<Card card={mockCard} />)

      const { name, cost, onPlayDescription, categories, flavor } = mockCard

      expect(getByText(name)).toBeInTheDocument()
      expect(getByText(joinCardCategories(categories))).toBeInTheDocument()
      expect(getByText(onPlayDescription as string)).toBeInTheDocument()
      expect(getByText(cost)).toBeInTheDocument()
      expect(getByText(flavor as string)).toBeInTheDocument()
      expect(queryByText('0')).not.toBeInTheDocument() // No strength for instant cards
    })

    it('displays on play effect description', () => {
      const mockCard = allCardBases.hammeriteNovice as CharacterCardBase

      const { getByText } = render(<Card card={mockCard} />)

      const { onPlayDescription } = mockCard

      expect(getByText(onPlayDescription as string)).toBeInTheDocument()
    })

    it('displays on discard effect description', () => {
      const mockCard = allCardBases.houseGuard as CharacterCardBase

      const { getByText } = render(<Card card={mockCard} />)

      const { onDiscardDescription } = mockCard

      expect(getByText(onDiscardDescription as string)).toBeInTheDocument()
    })

    it('displays card description', () => {
      const mockCard = allCardBases.zombie as CharacterCardBase

      const { getByText } = render(<Card card={mockCard} />)

      const { description } = mockCard

      expect(getByText(description as string)).toBeInTheDocument()
    })

    it('shows counter icon and count', () => {
      const mockCard = allCardBases.highPriestMarkander as CharacterCardBase

      const { getByTestId, getByText } = render(<Card card={mockCard} />)

      expect(getByTestId('counter-icon')).toBeInTheDocument()

      if (mockCard.counter) {
        expect(getByText(mockCard.counter.toString())).toBeInTheDocument()
      }
    })
  })

  describe('Traits', () => {
    it('shows retaliates icon and description if character has retaliates trait', () => {
      const mockCard = allCardBases.templeGuard as CharacterCardBase

      const { getByText, getByTestId } = render(<Card card={mockCard} />)

      const { retaliatesDescription } = messages.card.traits

      expect(getByTestId('retaliates-icon')).toBeInTheDocument()

      expect(getByText(retaliatesDescription)).toBeInTheDocument()
    })

    it('shows hidden icon and description if character has hidden trait', () => {
      const mockCard = allCardBases.garrettMasterThief as CharacterCardBase

      const { getByText, getByTestId } = render(<Card card={mockCard} />)

      const { hiddenDescription } = messages.card.traits

      expect(getByTestId('hidden-icon')).toBeInTheDocument()
      expect(getByText(hiddenDescription)).toBeInTheDocument()
    })
  })
})
