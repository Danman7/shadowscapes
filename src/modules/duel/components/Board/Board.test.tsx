import userEvent from '@testing-library/user-event'

import { formatString, messages } from 'src/i18n'
import { checkMarkIcon } from 'src/jest.setup'
import { Board } from 'src/modules/duel/components/Board/Board'
import {
  bottomPlayerBoardCardId,
  bottomPlayerDeckCardId,
  bottomPlayerHandCardId,
  topPlayerBoardCardId,
  topPlayerDeckCardId,
  topPlayerHandCardId,
} from 'src/modules/duel/components/constants'
import {
  INITIAL_CARDS_DRAWN_AMOUNT,
  STARTING_COINS,
} from 'src/modules/duel/constants'
import {
  mockInitializeDuelMockState,
  mockStackedDuelState,
} from 'src/modules/duel/mocks'
import { DuelState } from 'src/modules/duel/types'
import { mockLoadedUserState } from 'src/modules/user/mocks'
import { UserState } from 'src/modules/user/types'
import { render, RenderResult } from 'src/test-utils'
import { deepClone } from 'src/utils'

let preloadedDuel: DuelState
let preloadedUser: UserState
let renderResult: () => RenderResult

beforeEach(() => {
  preloadedDuel = deepClone(mockStackedDuelState)
  preloadedUser = deepClone(mockLoadedUserState)

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

    it('should show the deck and discard counts for both players', () => {
      const { getAllByText } = renderResult()

      const { players } = preloadedDuel

      Object.values(players).forEach(({ deck }) => {
        expect(
          getAllByText(`${messages.duel.deckLabel}: ${deck.length}`).length,
        ).toBeGreaterThan(0)
      })
    })

    it('should not show the deck or discard counts if the stacks are empty', () => {
      preloadedDuel.players[preloadedDuel.activePlayerId].deck = []
      preloadedDuel.players[preloadedDuel.activePlayerId].discard = []
      preloadedDuel.players[preloadedDuel.inactivePlayerId].deck = []
      preloadedDuel.players[preloadedDuel.inactivePlayerId].discard = []

      const { queryByText } = renderResult()

      const { players } = preloadedDuel

      Object.values(players).forEach(({ deck }) => {
        expect(
          queryByText(`${messages.duel.deckLabel}: ${deck.length}`),
        ).not.toBeInTheDocument()
      })
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

    it("should show all face up cards in the user's hand, but non in the opponent's hand", () => {
      const { getAllByTestId, getByText, queryByText } = renderResult()

      const { players, activePlayerId, inactivePlayerId, cards } = preloadedDuel
      const topPlayerHand = players[inactivePlayerId].hand
      const bottomPlayerHand = players[activePlayerId].hand

      expect(getAllByTestId(topPlayerHandCardId)).toHaveLength(
        topPlayerHand.length,
      )

      topPlayerHand.forEach((cardId) => {
        const card = cards[cardId]

        expect(queryByText(card.name)).not.toBeInTheDocument()
      })

      expect(getAllByTestId(bottomPlayerHandCardId)).toHaveLength(
        bottomPlayerHand.length,
      )

      bottomPlayerHand.forEach((cardId) => {
        const card = cards[cardId]
        expect(getByText(card.name)).toBeInTheDocument()
      })
    })

    it('should not show any cards in the players hands if the user is not in the game', () => {
      preloadedUser.user.id = 'user-not-in-game'

      const { getAllByTestId, queryByText } = renderResult()

      const { players, activePlayerId, inactivePlayerId, cards } = preloadedDuel
      const topPlayerHand = players[activePlayerId].hand
      const bottomPlayerHand = players[inactivePlayerId].hand

      expect(getAllByTestId(topPlayerHandCardId)).toHaveLength(
        topPlayerHand.length,
      )

      topPlayerHand.forEach((cardId) => {
        const card = cards[cardId]

        expect(queryByText(card.name)).not.toBeInTheDocument()
      })

      expect(getAllByTestId(bottomPlayerHandCardId)).toHaveLength(
        bottomPlayerHand.length,
      )

      bottomPlayerHand.forEach((cardId) => {
        const card = cards[cardId]
        expect(queryByText(card.name)).not.toBeInTheDocument()
      })
    })
  })

  describe('Duel Start Sequence', () => {
    it('should show intro screen when duel is initialized then move on to initial draw', () => {
      jest.useFakeTimers()

      preloadedDuel = mockInitializeDuelMockState

      const { getByText, queryByText, act } = renderResult()

      const { players, activePlayerId } = preloadedDuel

      Object.values(players).forEach((player) => {
        expect(getByText(player.name)).toBeInTheDocument()
      })

      expect(
        getByText(
          formatString(messages.duel.firstPlayer, {
            playerName: players[activePlayerId].name,
          }),
        ),
      ).toBeInTheDocument()

      act(() => {
        jest.runAllTimers()
      })

      expect(
        queryByText(
          formatString(messages.duel.firstPlayer, {
            playerName: players[activePlayerId].name,
          }),
        ),
      ).not.toBeInTheDocument()
    })

    it('should draw initial cards for both players and move on to redraw', () => {
      preloadedDuel = mockInitializeDuelMockState
      preloadedDuel.phase = 'Initial Draw'

      const { getAllByTestId, queryByText, getByText, act } = renderResult()

      const { players, activePlayerId, inactivePlayerId, cards } = preloadedDuel
      const topPlayerDeck = players[inactivePlayerId].deck
      const bottomPlayerDeck = players[activePlayerId].deck
      const bottomPlayerHand = players[activePlayerId].hand

      act(() => {
        jest.runAllTimers()
      })

      expect(getAllByTestId(topPlayerHandCardId)).toHaveLength(
        INITIAL_CARDS_DRAWN_AMOUNT,
      )
      expect(getAllByTestId(topPlayerDeckCardId)).toHaveLength(
        topPlayerDeck.length - INITIAL_CARDS_DRAWN_AMOUNT,
      )

      expect(getAllByTestId(bottomPlayerHandCardId)).toHaveLength(
        INITIAL_CARDS_DRAWN_AMOUNT,
      )
      expect(getAllByTestId(bottomPlayerDeckCardId)).toHaveLength(
        bottomPlayerDeck.length - INITIAL_CARDS_DRAWN_AMOUNT,
      )

      bottomPlayerHand.forEach((cardId) => {
        const card = cards[cardId]
        expect(getByText(card.name)).toBeInTheDocument()
      })

      expect(
        queryByText(messages.duel.redrawPhaseModal),
      ).not.toBeInTheDocument()
      expect(queryByText(messages.duel.skipRedraw)).not.toBeInTheDocument()

      act(() => {
        jest.runAllTimers()
      })

      expect(getByText(messages.duel.redrawPhaseModal)).toBeInTheDocument()
    })

    it('should show redraw modal and skip button after initial draw', () => {
      preloadedDuel = mockInitializeDuelMockState
      preloadedDuel.phase = 'Redrawing'

      const { getByText } = renderResult()

      expect(getByText(messages.duel.redrawPhaseModal)).toBeInTheDocument()
      expect(getByText(messages.duel.skipRedraw)).toBeInTheDocument()
    })

    it('should put a card at the bottom of the deck when it is replaced during redraw then draw another one', async () => {
      jest.useRealTimers()

      const user = userEvent.setup()
      preloadedDuel.phase = 'Redrawing'

      const { getAllByTestId, getByText, queryByText, waitFor } = renderResult()

      const { players, activePlayerId, cards } = preloadedDuel
      const bottomPlayerDeck = players[activePlayerId].deck
      const bottomPlayerHand = players[activePlayerId].hand
      const replacedCardId = bottomPlayerHand[0]
      const replacedCardName = cards[replacedCardId].name
      const replacedCardElement = getByText(replacedCardName)
      const drawnCardName = cards[bottomPlayerDeck[0]].name

      expect(replacedCardElement).toBeInTheDocument()

      expect(getAllByTestId(bottomPlayerHandCardId)).toHaveLength(
        bottomPlayerHand.length,
      )
      expect(getAllByTestId(bottomPlayerDeckCardId)).toHaveLength(
        bottomPlayerDeck.length,
      )

      await user.click(replacedCardElement)

      await waitFor(() => {
        expect(queryByText(replacedCardName)).not.toBeInTheDocument()
      })

      await waitFor(() => {
        expect(getByText(drawnCardName)).toBeInTheDocument()
      })
    })

    it('should show that user is waiting for opponent to redraw on redrawing a card', async () => {
      const user = userEvent.setup()
      preloadedDuel.phase = 'Redrawing'

      const { getByText, getByTestId } = renderResult()

      const { players, activePlayerId, cards } = preloadedDuel

      const bottomPlayerHand = players[activePlayerId].hand
      const replacedCardElement = getByText(cards[bottomPlayerHand[0]].name)

      await user.click(replacedCardElement)

      const button = getByText(messages.duel.waitForOpponent)

      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
      expect(getByTestId(checkMarkIcon)).toBeInTheDocument()
    })

    it('should not show the button if user is not in the game', () => {
      preloadedUser.user.id = 'user-not-in-game'
      preloadedDuel.phase = 'Redrawing'

      const { queryByText } = renderResult()

      expect(queryByText(messages.duel.skipRedraw)).not.toBeInTheDocument()
    })
  })
})
