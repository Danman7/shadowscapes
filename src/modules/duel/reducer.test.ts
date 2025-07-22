import { INITIAL_CARDS_DRAWN_AMOUNT } from 'src/modules/duel/constants'
import {
  mockInitializeDuelMockState,
  mockStackedDuelState,
} from 'src/modules/duel/mocks'
import { duelReducer, initialState } from 'src/modules/duel/reducer'
import {
  DrawACardAction,
  DrawInitialCardsAction,
  DuelAction,
  DuelStartingUsers,
  InitialiseDuelAction,
  PlayerReadyWithRedrawAction,
  ProgressToInitialDrawAction,
  ProgressToRedrawAction,
  PutCardAtBottomOfDeckAction,
} from 'src/modules/duel/types'
import { mockChaosUser, mockOrderUser } from 'src/modules/user/mocks'

describe('Duel Reducer', () => {
  it('should return current state for unknown actions', () => {
    const action = { type: 'UNKNOWN_ACTION' } as unknown as DuelAction

    const newState = duelReducer(initialState, action)

    expect(newState).toBe(initialState)
  })

  it('should convert users to players and set activePlayerId when INITIALISE_DUEL is dispatched', () => {
    const users: DuelStartingUsers = [mockOrderUser, mockChaosUser]

    const action: InitialiseDuelAction = {
      type: 'INITIALISE_DUEL',
      users,
    }

    const { players, cards, activePlayerId, inactivePlayerId } = duelReducer(
      initialState,
      action,
    )

    expect(Object.values(cards)).toHaveLength(
      mockOrderUser.draftDeck.length + mockChaosUser.draftDeck.length,
    )

    users.forEach(({ id }) => {
      expect(players[id]).toBeDefined()
    })

    expect(users).toContainEqual(
      expect.objectContaining({ id: activePlayerId }),
    )
    expect(users).toContainEqual(
      expect.objectContaining({ id: inactivePlayerId }),
    )
  })

  it('should update phase when PROGRESS_TO_INITIAL_DRAW is dispatched', () => {
    const action: ProgressToInitialDrawAction = {
      type: 'PROGRESS_TO_INITIAL_DRAW',
    }

    const { phase } = duelReducer(initialState, action)

    expect(phase).toBe('Initial Draw')
  })

  describe('Duel Start Sequence', () => {
    it('should draw initial cards for both players when DRAW_INITIAL_CARDS is dispatched', () => {
      const action: DrawInitialCardsAction = {
        type: 'DRAW_INITIAL_CARDS',
      }

      const { players } = duelReducer(mockInitializeDuelMockState, action)

      Object.values(players).forEach(({ hand, deck, id }) => {
        expect(hand.length).toBe(INITIAL_CARDS_DRAWN_AMOUNT)
        expect(deck.length).toBe(
          mockInitializeDuelMockState.players[id].deck.length -
            INITIAL_CARDS_DRAWN_AMOUNT,
        )
      })
    })

    it('should update phase when PROGRESS_TO_REDRAW is dispatched', () => {
      const action: ProgressToRedrawAction = {
        type: 'PROGRESS_TO_REDRAW',
      }

      const { phase } = duelReducer(initialState, action)

      expect(phase).toBe('Redrawing')
    })

    it('should put a card at the end of the deck when PUT_CARD_AT_BOTTOM_OF_DECK is dispatched', () => {
      const { activePlayerId } = mockStackedDuelState

      const movedCardId = mockStackedDuelState.players[activePlayerId].hand[0]

      const action: PutCardAtBottomOfDeckAction = {
        type: 'PUT_CARD_AT_BOTTOM_OF_DECK',
        playerId: activePlayerId,
        cardId: movedCardId,
      }

      const { players } = duelReducer(mockStackedDuelState, action)
      const { hand, deck } = players[activePlayerId]

      expect(hand).not.toContain(movedCardId)
      expect(deck[deck.length - 1]).toBe(movedCardId)
    })

    it('should draw a card from the top of the deck when DRAW_A_CARD is dispatched', () => {
      const { activePlayerId } = mockStackedDuelState
      const drawnCardId = mockStackedDuelState.players[activePlayerId].deck[0]

      const action: DrawACardAction = {
        type: 'DRAW_A_CARD',
        playerId: activePlayerId,
      }

      const { players } = duelReducer(mockStackedDuelState, action)
      const { hand, deck } = players[activePlayerId]

      expect(deck).not.toContain(drawnCardId)
      expect(hand).toContain(drawnCardId)
    })

    it('should indicate player has perfomed an action when PLAYER_READY is dispatched', () => {
      const { activePlayerId, inactivePlayerId } = mockStackedDuelState

      const action: PlayerReadyWithRedrawAction = {
        type: 'PLAYER_READY_WITH_REDRAW',
        playerId: activePlayerId,
      }

      const newState = duelReducer(mockStackedDuelState, action)

      expect(newState.players[activePlayerId].hasPerformedAction).toBe(true)
      expect(newState.players[inactivePlayerId].hasPerformedAction).toBe(false)
    })
  })
})
