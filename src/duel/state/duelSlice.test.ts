import { INITIAL_CARDS_DRAWN, INITIAL_PLAYER_COINS } from '../constants'
import {
  mockChaosUser,
  mockOrderUser,
  setupMockedDuel,
} from '../../user/mocks'
import {
  completePlayTurn,
  drawForPlayers,
  drawInitialHands,
  duelReducer,
  initiateDuelFromUsers,
  passPlayTurn,
  playCard,
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

test('plays a character with explicit player, instance, and base identity', () => {
  const initialState = setupMockedDuel({
    activePlayer: { coins: 2, hand: 'novice' },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const cardInstanceId = initialState.players[playerId].hand[0]
  const action = playCard({
    playerId,
    cardInstanceId,
    cardBaseId: 'novice',
  })

  expect(action.payload).toEqual({
    playerId,
    cardInstanceId,
    cardBaseId: 'novice',
  })

  const playedState = duelReducer(initialState, action)

  expect(playedState.players[playerId]).toMatchObject({
    coins: 1,
    hand: [],
    board: [cardInstanceId],
    hasActedThisPhase: true,
  })
  expect(playedState.cards[cardInstanceId].stack).toBe('board')
  expect(playedState.pendingPlayedCardId).toBe(cardInstanceId)

  const completedState = duelReducer(playedState, completePlayTurn())

  expect(completedState.players[playerId].board).toEqual([cardInstanceId])
  expect(completedState.playerOrder).toEqual([
    initialState.playerOrder[1],
    initialState.playerOrder[0],
  ])
  expect(completedState.pendingPlayedCardId).toBeNull()
  expect(completedState.phase).toBe('play')
})

test('discards an instance when its play turn completes', () => {
  const initialState = setupMockedDuel({
    activePlayer: { coins: 3, hand: 'yoraSkull' },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const cardInstanceId = initialState.players[playerId].hand[0]
  const playedState = duelReducer(
    initialState,
    playCard({ playerId, cardInstanceId, cardBaseId: 'yoraSkull' }),
  )

  expect(playedState.players[playerId].board).toEqual([cardInstanceId])

  const completedState = duelReducer(playedState, completePlayTurn())

  expect(completedState.players[playerId]).toMatchObject({
    coins: 0,
    board: [],
    discard: [cardInstanceId],
  })
  expect(completedState.cards[cardInstanceId].stack).toBe('discard')
})

test('does not discard a pending instance missing from the player board', () => {
  const initialState = setupMockedDuel({
    activePlayer: { hand: 'yoraSkull' },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const cardInstanceId = initialState.players[playerId].hand[0]
  const playedState = duelReducer(
    initialState,
    playCard({ playerId, cardInstanceId, cardBaseId: 'yoraSkull' }),
  )
  const inconsistentState = structuredClone(playedState)

  inconsistentState.players[playerId].board = []

  const completedState = duelReducer(inconsistentState, completePlayTurn())

  expect(completedState.cards[cardInstanceId].stack).toBe('board')
  expect(completedState.players[playerId].discard).toEqual([])
  expect(completedState.pendingPlayedCardId).toBeNull()
})

test('passes a play turn and hands control to the other player', () => {
  const initialState = setupMockedDuel({ phase: 'play' })
  const playerId = initialState.playerOrder[0]
  const passedState = duelReducer(initialState, passPlayTurn())

  expect(passedState.players[playerId].hasActedThisPhase).toBe(true)

  const completedState = duelReducer(passedState, completePlayTurn())

  expect(completedState.playerOrder).toEqual([
    initialState.playerOrder[1],
    initialState.playerOrder[0],
  ])
  expect(completedState.phase).toBe('play')
})

test('enters act with the first player active and fresh acted flags', () => {
  const initialState = setupMockedDuel({
    activePlayer: { hasActedThisPhase: false },
    inactivePlayer: { hasActedThisPhase: true },
    phase: 'play',
  })
  const secondPlayerId = initialState.playerOrder[0]
  const firstPlayerId = initialState.playerOrder[1]
  const completedState = duelReducer(
    duelReducer(initialState, passPlayTurn()),
    completePlayTurn(),
  )

  expect(completedState.phase).toBe('act')
  expect(completedState.playerOrder).toEqual([firstPlayerId, secondPlayerId])
  expect(
    completedState.playerOrder.every(
      (playerId) => !completedState.players[playerId].hasActedThisPhase,
    ),
  ).toBe(true)
})

test('rejects unaffordable, inactive-player, mismatched, and repeated plays', () => {
  const unaffordableState = setupMockedDuel({
    activePlayer: { coins: 0, hand: 'novice' },
    phase: 'play',
  })
  const activePlayerId = unaffordableState.playerOrder[0]
  const activeCardId = unaffordableState.players[activePlayerId].hand[0]

  expect(
    duelReducer(
      unaffordableState,
      playCard({
        playerId: activePlayerId,
        cardInstanceId: activeCardId,
        cardBaseId: 'novice',
      }),
    ),
  ).toEqual(unaffordableState)

  const state = setupMockedDuel({
    activePlayer: { hand: 'novice' },
    inactivePlayer: { hand: 'zombie' },
    phase: 'play',
  })
  const [playerId, inactivePlayerId] = state.playerOrder
  const cardInstanceId = state.players[playerId].hand[0]
  const inactiveCardId = state.players[inactivePlayerId].hand[0]

  expect(
    duelReducer(
      state,
      playCard({
        playerId: inactivePlayerId,
        cardInstanceId: inactiveCardId,
        cardBaseId: 'zombie',
      }),
    ),
  ).toEqual(state)
  expect(
    duelReducer(
      state,
      playCard({
        playerId,
        cardInstanceId,
        cardBaseId: 'templeGuard',
      }),
    ),
  ).toEqual(state)

  const playedState = duelReducer(
    state,
    playCard({ playerId, cardInstanceId, cardBaseId: 'novice' }),
  )

  expect(
    duelReducer(
      playedState,
      playCard({ playerId, cardInstanceId, cardBaseId: 'novice' }),
    ),
  ).toEqual(playedState)
})

test('ignores play-turn actions outside their valid state', () => {
  const state = setupMockedDuel({ activePlayer: { hand: 'novice' } })
  const playerId = state.playerOrder[0]
  const cardInstanceId = state.players[playerId].hand[0]

  expect(
    duelReducer(
      state,
      playCard({ playerId, cardInstanceId, cardBaseId: 'novice' }),
    ),
  ).toEqual(state)
  expect(duelReducer(state, passPlayTurn())).toEqual(state)
  expect(duelReducer(state, completePlayTurn())).toEqual(state)
})
