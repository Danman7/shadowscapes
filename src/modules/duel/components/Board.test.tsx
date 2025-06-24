import { messages } from 'src/i18n/indext'
import { Board } from 'src/modules/duel/components/Board'
import {
  bottomPlayerBoardCardId,
  bottomPlayerDeckCardId,
  topPlayerBoardCardId,
  topPlayerDeckCardId,
} from 'src/modules/duel/components/constants'
import { STARTING_COINS } from 'src/modules/duel/constants'
import { mockStackedDuelState } from 'src/modules/duel/mocks'
import { DuelState } from 'src/modules/duel/types'
import { mockLoadedUserState } from 'src/modules/user/mocks'
import { UserState } from 'src/modules/user/types'
import { render, RenderResult } from 'src/test-utils'

let preloadedDuel: DuelState
let preloadedUser: UserState
let renderResult: () => RenderResult

beforeEach(() => {
  preloadedDuel = { ...mockStackedDuelState }
  preloadedUser = { ...mockLoadedUserState }

  renderResult = () =>
    render(<Board />, {
      preloadedDuel,
      preloadedUser,
    })
})

describe('Board Component', () => {
  describe('UI and Stacks', () => {
    it('should show loader if user is not loaded', () => {
      preloadedUser.isUserLoaded = false
      const { getByText } = renderResult()

      expect(getByText(messages.user.loadingUser)).toBeInTheDocument()
    })

    it("should show both player's info", () => {
      preloadedDuel.players[preloadedDuel.inactivePlayerId].coins =
        STARTING_COINS - 5
      preloadedDuel.players[preloadedDuel.inactivePlayerId].income = 11
      const { getByText } = renderResult()

      const { players } = preloadedDuel

      Object.values(players).forEach(({ name, coins, income }) => {
        expect(getByText(name)).toBeInTheDocument()
        expect(getByText(coins)).toBeInTheDocument()

        if (income) {
          expect(getByText(income)).toBeInTheDocument()
        }
      })
    })

    it('renders user player at the bottom', () => {
      const { getByText } = renderResult()

      const { players, activePlayerId, inactivePlayerId } = preloadedDuel
      const topPlayerName = getByText(players[inactivePlayerId].name)
      const bottomPlayerName = getByText(players[activePlayerId].name)

      // Check that topPlayer appears before bottomPlayer in the DOM
      expect(
        topPlayerName.compareDocumentPosition(bottomPlayerName) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    })

    it("should show all face down cards in both players' decks", () => {
      const { getAllByTestId, queryByText } = renderResult()

      const { players, activePlayerId, inactivePlayerId, cards } = preloadedDuel
      const topPlayerDeck = players[inactivePlayerId].deck
      const bottomPlayerDeck = players[activePlayerId].deck

      expect(getAllByTestId(topPlayerDeckCardId)).toHaveLength(
        topPlayerDeck.length,
      )

      topPlayerDeck.forEach((cardId) => {
        const card = cards[cardId]
        expect(queryByText(card.name)).not.toBeInTheDocument()
      })

      expect(getAllByTestId(bottomPlayerDeckCardId)).toHaveLength(
        bottomPlayerDeck.length,
      )

      bottomPlayerDeck.forEach((cardId) => {
        const card = cards[cardId]
        expect(queryByText(card.name)).not.toBeInTheDocument()
      })
    })

    it("should show all face down cards in both players' discard piles", () => {
      const { getAllByTestId, queryByText } = renderResult()

      const { players, activePlayerId, inactivePlayerId, cards } = preloadedDuel
      const topPlayerDiscard = players[inactivePlayerId].discard
      const bottomPlayerDiscard = players[activePlayerId].discard

      expect(getAllByTestId(topPlayerDeckCardId)).toHaveLength(
        topPlayerDiscard.length,
      )

      topPlayerDiscard.forEach((cardId) => {
        const card = cards[cardId]
        expect(queryByText(card.name)).not.toBeInTheDocument()
      })

      expect(getAllByTestId(bottomPlayerDeckCardId)).toHaveLength(
        bottomPlayerDiscard.length,
      )

      bottomPlayerDiscard.forEach((cardId) => {
        const card = cards[cardId]
        expect(queryByText(card.name)).not.toBeInTheDocument()
      })
    })

    it("should show all face up cards on both players' boards", () => {
      const { getAllByTestId, getByText, queryByText } = renderResult()

      const { players, activePlayerId, inactivePlayerId, cards } = preloadedDuel
      const topPlayerBoard = players[inactivePlayerId].board
      const bottomPlayerBoard = players[activePlayerId].board

      expect(getAllByTestId(topPlayerBoardCardId)).toHaveLength(
        topPlayerBoard.length,
      )

      topPlayerBoard.forEach((cardId) => {
        const card = cards[cardId]

        if (card.type === 'character' && card.traits?.includes('hidden')) {
          expect(queryByText(card.name)).not.toBeInTheDocument()
        } else {
          expect(getByText(card.name)).toBeInTheDocument()
        }
      })

      expect(getAllByTestId(bottomPlayerBoardCardId)).toHaveLength(
        bottomPlayerBoard.length,
      )

      bottomPlayerBoard.forEach((cardId) => {
        const card = cards[cardId]
        expect(getByText(card.name)).toBeInTheDocument()
      })
    })
  })
})
