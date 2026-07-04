import { INITIAL_CARDS_DRAWN, INITIAL_PLAYER_COINS } from '../constants'
import { mockChaosUser, mockOrderUser } from '../../user/mocks'
import {
  drawForPlayers,
  drawInitialHands,
  duelReducer,
  initiateDuelFromUsers,
} from './duelSlice'

beforeEach(() => {
  let id = 0

  vi.spyOn(Math, 'random').mockReturnValue(0)
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

test('selects the active player with a coin toss', () => {
  vi.mocked(Math.random).mockReturnValueOnce(0.5)

  const state = duelReducer(
    undefined,
    initiateDuelFromUsers([mockOrderUser, mockChaosUser]),
  )

  expect(state.playerOrder).toEqual([mockChaosUser.id, mockOrderUser.id])
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
    expect(deckCards.map((card) => card.baseId).sort()).toEqual(
      [...user.activeDeck].sort(),
    )
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

test('shuffles each player deck', () => {
  const users = [mockOrderUser, mockChaosUser]
  const state = duelReducer(
    undefined,
    initiateDuelFromUsers([mockOrderUser, mockChaosUser]),
  )

  users.forEach((user) => {
    const shuffledBaseIds = state.players[user.id].deck.map(
      (cardId) => state.cards[cardId].baseId,
    )

    expect(shuffledBaseIds).not.toEqual(user.activeDeck)
  })
})

test('draws each initial hand and moves to the draw phase', () => {
  const initiatedState = duelReducer(
    undefined,
    initiateDuelFromUsers([mockOrderUser, mockChaosUser]),
  )
  const state = duelReducer(initiatedState, drawInitialHands())

  state.playerOrder.forEach((playerId) => {
    const player = state.players[playerId]

    expect(player.hand).toHaveLength(INITIAL_CARDS_DRAWN)
    player.hand.forEach((cardId) => {
      expect(state.cards[cardId].stack).toBe('hand')
    })
  })
  expect(state.phase).toBe('draw')
})

test('fills partially drawn initial hands without exceeding the initial amount', () => {
  let state = duelReducer(
    undefined,
    initiateDuelFromUsers([mockOrderUser, mockChaosUser]),
  )
  const playerId = state.playerOrder[0]
  const firstCardId = state.players[playerId].deck[0]

  state = structuredClone(state)
  state.players[playerId].deck.shift()
  state.players[playerId].hand.push(firstCardId)
  state.cards[firstCardId].stack = 'hand'
  state = duelReducer(state, drawInitialHands())

  expect(state.players[playerId].hand).toHaveLength(INITIAL_CARDS_DRAWN)
  expect(state.phase).toBe('draw')
})

test('does not draw initial hands unless both players need cards', () => {
  let state = duelReducer(
    undefined,
    initiateDuelFromUsers([mockOrderUser, mockChaosUser]),
  )
  const playerId = state.playerOrder[0]

  state = structuredClone(state)
  const initialHand = state.players[playerId].deck.splice(
    0,
    INITIAL_CARDS_DRAWN,
  )
  state.players[playerId].hand.push(...initialHand)
  initialHand.forEach((cardId) => {
    state.cards[cardId].stack = 'hand'
  })
  const stateBeforeAction = structuredClone(state)

  expect(duelReducer(state, drawInitialHands())).toEqual(stateBeforeAction)
})

test('draws one card for both players and moves to the play phase', () => {
  let state = duelReducer(
    undefined,
    initiateDuelFromUsers([mockOrderUser, mockChaosUser]),
  )

  state = duelReducer(state, drawInitialHands())
  state = duelReducer(state, drawForPlayers())

  state.playerOrder.forEach((playerId) => {
    expect(state.players[playerId].hand).toHaveLength(INITIAL_CARDS_DRAWN + 1)
  })
  expect(state.phase).toBe('play')
})

test('does not draw for players outside the draw phase', () => {
  const state = duelReducer(
    undefined,
    initiateDuelFromUsers([mockOrderUser, mockChaosUser]),
  )
  const stateBeforeAction = structuredClone(state)

  expect(duelReducer(state, drawForPlayers())).toEqual(stateBeforeAction)
})
