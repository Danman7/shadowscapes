import { joinCardCategories } from 'src/modules/cards/utils'
import { BoardCard } from 'src/modules/duel/components/BoardCard'
import { createDuelCardFromBase } from 'src/modules/duel/utils'
import { render } from 'src/test-utils'

describe('Card Component', () => {
  describe('Props', () => {
    const [, duelCard] = createDuelCardFromBase('templeGuard')

    it('displays child Card component', () => {
      const { getByText } = render(<BoardCard duelCard={duelCard} />)

      const { name, cost, categories, flavor } = duelCard

      expect(getByText(name)).toBeInTheDocument()
      expect(getByText(joinCardCategories(categories))).toBeInTheDocument()
      expect(getByText(cost)).toBeInTheDocument()
      expect(getByText(flavor as string)).toBeInTheDocument()
    })

    it('should not show card information when isFaceDown is true', () => {
      const { queryByText } = render(
        <BoardCard duelCard={duelCard} isFaceDown />,
      )

      expect(queryByText(duelCard.name)).not.toBeInTheDocument()
      expect(queryByText(duelCard.flavor as string)).not.toBeInTheDocument()
    })

    it('flips the card when isFaceDown changes', () => {
      const { rerender, getByText, queryByText } = render(
        <BoardCard duelCard={duelCard} isFaceDown />,
      )

      expect(queryByText(duelCard.name)).not.toBeInTheDocument()

      rerender(<BoardCard duelCard={duelCard} />)

      expect(getByText(duelCard.name)).toBeInTheDocument()

      rerender(<BoardCard duelCard={duelCard} isFaceDown />)

      expect(queryByText(duelCard.name)).not.toBeInTheDocument()
    })
  })
})
