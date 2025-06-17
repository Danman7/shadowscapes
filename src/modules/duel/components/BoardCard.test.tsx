import { BoardCard } from 'src/modules/duel/components/BoardCard'
import { mockStackedDuelState } from 'src/modules/duel/mocks'
import { DuelState } from 'src/modules/duel/types'
import { mockLoadedUserState as preloadedUser } from 'src/modules/user/mocks'
import { render, RenderResult } from 'src/test-utils'

let preloadedDuel: DuelState
let renderResult: (cardId: string) => RenderResult

beforeEach(() => {
  preloadedDuel = { ...mockStackedDuelState }

  renderResult = (cardId: string) =>
    render(<BoardCard cardId={cardId} />, {
      preloadedDuel,
      preloadedUser,
    })
})

describe('BoardCard Component', () => {
  describe('Show', () => {
    it('displays card content when it belongs to user and is in hand', () => {
      const { players, activePlayerId, cards } = preloadedDuel

      const cardId = players[activePlayerId].hand[0]

      const { getByText } = renderResult(cardId)

      expect(getByText(cards[cardId].name)).toBeInTheDocument()
    })

    it('displays card content when it belongs to user and is on board', () => {
      const { players, activePlayerId, cards } = preloadedDuel

      const cardId = players[activePlayerId].board[0]

      const { getByText } = renderResult(cardId)

      expect(getByText(cards[cardId].name)).toBeInTheDocument()
    })

    it('displays card content when it does not belong user but is on board', () => {
      const { players, inactivePlayerId, cards } = preloadedDuel

      const cardId = players[inactivePlayerId].board[0]

      const { getByText } = renderResult(cardId)

      expect(getByText(cards[cardId].name)).toBeInTheDocument()
    })
  })

  describe('Hide', () => {
    it('hides card content when it belongs to user but is in deck', () => {
      const { players, activePlayerId, cards } = preloadedDuel

      const cardId = players[activePlayerId].deck[0]

      const { queryByText } = renderResult(cardId)

      expect(queryByText(cards[cardId].name)).not.toBeInTheDocument()
    })

    it('hides card content when it belongs to user but is in discard', () => {
      const { players, activePlayerId, cards } = preloadedDuel

      const cardId = players[activePlayerId].discard[0]

      const { queryByText } = renderResult(cardId)

      expect(queryByText(cards[cardId].name)).not.toBeInTheDocument()
    })

    it('hides card content when it does not belong user and is in hand', () => {
      const { players, inactivePlayerId, cards } = preloadedDuel

      const cardId = players[inactivePlayerId].hand[0]

      const { queryByText } = renderResult(cardId)

      expect(queryByText(cards[cardId].name)).not.toBeInTheDocument()
    })

    it('hides card content when it does not belong user and is in deck', () => {
      const { players, inactivePlayerId, cards } = preloadedDuel

      const cardId = players[inactivePlayerId].deck[0]

      const { queryByText } = renderResult(cardId)

      expect(queryByText(cards[cardId].name)).not.toBeInTheDocument()
    })

    it('hides card content when it does not belong user and is in discard', () => {
      const { players, inactivePlayerId, cards } = preloadedDuel

      const cardId = players[inactivePlayerId].discard[0]

      const { queryByText } = renderResult(cardId)

      expect(queryByText(cards[cardId].name)).not.toBeInTheDocument()
    })

    it('flips the card when isFaceDown changes', () => {
      const { players, activePlayerId, cards } = preloadedDuel

      const { rerender, getByText, queryByText } = renderResult(
        players[activePlayerId].deck[0],
      )

      expect(
        queryByText(cards[players[activePlayerId].deck[0]].name),
      ).not.toBeInTheDocument()

      rerender(<BoardCard cardId={players[activePlayerId].hand[0]} />)

      expect(
        getByText(cards[players[activePlayerId].hand[0]].name),
      ).toBeInTheDocument()

      rerender(<BoardCard cardId={players[activePlayerId].deck[0]} />)

      expect(
        queryByText(cards[players[activePlayerId].deck[0]].name),
      ).not.toBeInTheDocument()
    })

    it('should not show content when is not a user character and isHidden is true', () => {})
  })
})
