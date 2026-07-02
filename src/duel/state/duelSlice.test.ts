import { INITIAL_PLAYER_COINS } from '../constants'
import { mockChaosUser, mockOrderUser } from '../../user/mocks'
import { duelReducer, initiateDuelFromUsers } from './duelSlice'

beforeEach(() => {
  let id = 0

  vi.spyOn(crypto, 'randomUUID').mockImplementation(
    (): `${string}-${string}-${string}-${string}-${string}` =>
      `00000000-0000-4000-8000-${String(++id).padStart(12, '0')}`,
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('initiates duel players from two users', () => {
  const state = duelReducer(
    undefined,
    initiateDuelFromUsers([mockOrderUser, mockChaosUser]),
  )

  expect(state.playerOrder).toEqual([mockOrderUser.id, mockChaosUser.id])
  expect(state.players[mockOrderUser.id]).toEqual({
    id: mockOrderUser.id,
    name: mockOrderUser.name,
    coins: INITIAL_PLAYER_COINS,
    income: 0,
    deck: expect.any(Array),
    hand: [],
    board: [],
    discard: [],
    hasActedThisPhase: false,
  })
  expect(state.players[mockChaosUser.id]).toEqual({
    id: mockChaosUser.id,
    name: mockChaosUser.name,
    coins: INITIAL_PLAYER_COINS,
    income: 0,
    deck: expect.any(Array),
    hand: [],
    board: [],
    discard: [],
    hasActedThisPhase: false,
  })
})

test('creates each user deck as card instances in the duel state', () => {
  const state = duelReducer(
    undefined,
    initiateDuelFromUsers([mockOrderUser, mockChaosUser]),
  )

  const users = [mockOrderUser, mockChaosUser]

  users.forEach((user) => {
    const deckCards = state.players[user.id].deck.map(
      (cardId) => state.cards[cardId],
    )

    expect(deckCards).toHaveLength(user.activeDeck.length)
    expect(deckCards.map((card) => card.baseId)).toEqual(user.activeDeck)
    expect(deckCards).toEqual(
      expect.arrayContaining(
        user.activeDeck.map((baseId) =>
          expect.objectContaining({ baseId, ownerId: user.id, stack: 'deck' }),
        ),
      ),
    )
  })

  expect(Object.keys(state.cards)).toHaveLength(
    mockOrderUser.activeDeck.length + mockChaosUser.activeDeck.length,
  )
})
