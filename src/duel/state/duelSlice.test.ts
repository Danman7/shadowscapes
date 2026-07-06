import {
  DEFAULT_CHARACTER_STRENGTH,
  INCOME_PER_TURN,
  INITIAL_CARDS_DRAWN,
  INITIAL_PLAYER_COINS,
} from '../constants'
import { mockChaosUser, mockOrderUser, setupMockedDuel } from '../../user/mocks'
import {
  adjustCharacterLife,
  adjustPlayerIncome,
  attackCharacter,
  completeActTurn,
  completePlayTurn,
  completeRefresh,
  drawForPlayers,
  drawInitialHands,
  duelReducer,
  initiateDuelFromUsers,
  passActTurn,
  passPlayTurn,
  playCard,
  resolvePendingPlayedCard,
  summonAllCopies,
  summonCard,
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
    activePlayer: { coins: 3, hand: 'bookOfAsh' },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const cardInstanceId = initialState.players[playerId].hand[0]
  const playedState = duelReducer(
    initialState,
    playCard({ playerId, cardInstanceId, cardBaseId: 'bookOfAsh' }),
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

test('does not play a targeted instance without a valid board target', () => {
  const initialState = setupMockedDuel({
    activePlayer: { coins: 3, hand: 'yoraSkull' },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const cardInstanceId = initialState.players[playerId].hand[0]
  const state = duelReducer(
    initialState,
    playCard({ playerId, cardInstanceId, cardBaseId: 'yoraSkull' }),
  )

  expect(state.players[playerId]).toMatchObject({
    coins: 3,
    hand: [cardInstanceId],
    board: [],
    hasActedThisPhase: false,
  })
  expect(state.pendingPlayedCardId).toBeNull()
})

test('does not discard a pending instance missing from the player board', () => {
  const initialState = setupMockedDuel({
    activePlayer: { hand: 'bookOfAsh' },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const cardInstanceId = initialState.players[playerId].hand[0]
  const playedState = duelReducer(
    initialState,
    playCard({ playerId, cardInstanceId, cardBaseId: 'bookOfAsh' }),
  )
  const inconsistentState = structuredClone(playedState)

  inconsistentState.players[playerId].board = []

  const completedState = duelReducer(inconsistentState, completePlayTurn())

  expect(completedState.cards[cardInstanceId].stack).toBe('board')
  expect(completedState.players[playerId].discard).toEqual([])
  expect(completedState.pendingPlayedCardId).toBeNull()
})

test('does not resolve a non-pending card or a pending character', () => {
  const initialState = setupMockedDuel({
    activePlayer: { board: ['bookOfAsh', 'novice'] },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const [instanceId, characterId] = initialState.players[playerId].board
  const nonPendingState = structuredClone(initialState)

  nonPendingState.pendingPlayedCardId = instanceId

  expect(
    duelReducer(
      nonPendingState,
      resolvePendingPlayedCard({ cardInstanceId: characterId }),
    ),
  ).toEqual(nonPendingState)

  const pendingCharacterState = structuredClone(initialState)

  pendingCharacterState.pendingPlayedCardId = characterId

  expect(
    duelReducer(
      pendingCharacterState,
      resolvePendingPlayedCard({ cardInstanceId: characterId }),
    ),
  ).toEqual(pendingCharacterState)
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

test('stuns a character when it enters the board', () => {
  const initialState = setupMockedDuel({
    activePlayer: { hand: 'novice' },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const cardId = initialState.players[playerId].hand[0]
  const state = duelReducer(
    initialState,
    playCard({ playerId, cardInstanceId: cardId, cardBaseId: 'novice' }),
  )
  const card = state.cards[cardId]

  expect(card).toMatchObject({
    type: 'character',
    stack: 'board',
    turnsStunned: 1,
    didAct: false,
  })
})

test('summons a character for free without consuming the play turn', () => {
  const initialState = setupMockedDuel({
    activePlayer: { coins: 7, hand: 'novice' },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const cardId = initialState.players[playerId].hand[0]
  const state = duelReducer(
    initialState,
    summonCard({ playerId, cardInstanceId: cardId, from: 'hand' }),
  )

  expect(state.players[playerId]).toMatchObject({
    coins: 7,
    hand: [],
    board: [cardId],
    hasActedThisPhase: false,
  })
  expect(state.cards[cardId]).toMatchObject({
    stack: 'board',
    turnsStunned: 1,
  })
  expect(state.pendingPlayedCardId).toBeNull()
})

test('summons every matching character copy in source order', () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      hand: ['novice', 'acolyte', 'novice', 'yoraSkull', 'novice'],
      board: 'templeGuard',
    },
  })
  const playerId = initialState.playerOrder[0]
  const player = initialState.players[playerId]
  const existingBoardId = player.board[0]
  const noviceIds = player.hand.filter(
    (cardId) => initialState.cards[cardId].baseId === 'novice',
  )
  const remainingHandIds = player.hand.filter(
    (cardId) => initialState.cards[cardId].baseId !== 'novice',
  )
  const state = duelReducer(
    initialState,
    summonAllCopies({ playerId, cardBaseId: 'novice', from: 'hand' }),
  )

  expect(state.players[playerId].board).toEqual([
    existingBoardId,
    ...noviceIds,
  ])
  expect(state.players[playerId].hand).toEqual(remainingHandIds)
  noviceIds.forEach((cardId) => {
    expect(state.cards[cardId]).toMatchObject({
      stack: 'board',
      turnsStunned: 1,
    })
  })
})

test('ignores summoning all copies for a missing player', () => {
  const initialState = setupMockedDuel()

  expect(
    duelReducer(
      initialState,
      summonAllCopies({
        playerId: 'missing',
        cardBaseId: 'novice',
        from: 'hand',
      }),
    ),
  ).toEqual(initialState)
})

test('rejects summons with an invalid source, owner, or instance card', () => {
  const initialState = setupMockedDuel({
    activePlayer: { hand: ['novice', 'yoraSkull'] },
  })
  const [playerId, otherPlayerId] = initialState.playerOrder
  const [noviceId, instanceId] = initialState.players[playerId].hand

  expect(
    duelReducer(
      initialState,
      summonCard({ playerId, cardInstanceId: noviceId, from: 'discard' }),
    ),
  ).toEqual(initialState)
  expect(
    duelReducer(
      initialState,
      summonCard({
        playerId: otherPlayerId,
        cardInstanceId: noviceId,
        from: 'hand',
      }),
    ),
  ).toEqual(initialState)
  expect(
    duelReducer(
      initialState,
      summonCard({ playerId, cardInstanceId: instanceId, from: 'hand' }),
    ),
  ).toEqual(initialState)
})

test('adjusts life only for a character currently on its owner board', () => {
  const initialState = setupMockedDuel({
    activePlayer: { hand: 'novice', board: 'templeGuard' },
  })
  const playerId = initialState.playerOrder[0]
  const handCardId = initialState.players[playerId].hand[0]
  const boardCardId = initialState.players[playerId].board[0]
  const adjustedState = duelReducer(
    initialState,
    adjustCharacterLife({ cardInstanceId: boardCardId, amount: 2 }),
  )

  expect(adjustedState.cards[boardCardId]).toMatchObject({ life: 5 })
  expect(
    duelReducer(
      initialState,
      adjustCharacterLife({ cardInstanceId: handCardId, amount: 2 }),
    ),
  ).toEqual(initialState)
  expect(
    duelReducer(
      initialState,
      adjustCharacterLife({ cardInstanceId: 'missing', amount: 2 }),
    ),
  ).toEqual(initialState)
})

test('does not adjust income for a missing player', () => {
  const initialState = setupMockedDuel()
  const stateBeforeAction = structuredClone(initialState)

  expect(
    duelReducer(
      initialState,
      adjustPlayerIncome({ playerId: 'missing-player', amount: 1 }),
    ),
  ).toEqual(stateBeforeAction)
})

test('reduces stun once at the start of each owner play turn', () => {
  const initialState = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'haunt' },
    phase: 'draw',
  })
  const [firstPlayerId, secondPlayerId] = initialState.playerOrder
  const firstCardId = initialState.players[firstPlayerId].board[0]
  const secondCardId = initialState.players[secondPlayerId].board[0]
  const preparedState = structuredClone(initialState)

  if (
    preparedState.cards[firstCardId].type !== 'character' ||
    preparedState.cards[secondCardId].type !== 'character'
  ) {
    throw new Error('Expected character instances')
  }

  preparedState.cards[firstCardId].turnsStunned = 2
  preparedState.cards[secondCardId].turnsStunned = 1

  const firstPlayState = duelReducer(preparedState, drawForPlayers())
  expect(firstPlayState.cards[firstCardId]).toMatchObject({ turnsStunned: 1 })
  expect(firstPlayState.cards[secondCardId]).toMatchObject({ turnsStunned: 1 })

  const secondPlayState = duelReducer(
    duelReducer(firstPlayState, passPlayTurn()),
    completePlayTurn(),
  )
  expect(secondPlayState.cards[secondCardId]).toMatchObject({ turnsStunned: 0 })
})

test('deals strength damage, permits stunned defenders, and marks the attacker', () => {
  const initialState = setupMockedDuel({
    activePlayer: { board: 'templeGuard' },
    inactivePlayer: { board: 'haunt' },
    phase: 'act',
  })
  const [attackerPlayerId, defenderPlayerId] = initialState.playerOrder
  const attackerId = initialState.players[attackerPlayerId].board[0]
  const defenderId = initialState.players[defenderPlayerId].board[0]
  const preparedState = structuredClone(initialState)

  if (preparedState.cards[defenderId].type !== 'character') {
    throw new Error('Expected a character defender')
  }
  preparedState.cards[defenderId].turnsStunned = 2

  const state = duelReducer(
    preparedState,
    attackCharacter({ attackerId, defenderId }),
  )

  expect(state.cards[attackerId]).toMatchObject({ didAct: true, strength: 2 })
  expect(state.cards[defenderId]).toMatchObject({ life: 1, turnsStunned: 2 })
})

test('rejects stunned, repeated, wrong-player, and non-character attacks', () => {
  const initialState = setupMockedDuel({
    activePlayer: { board: ['novice', 'yoraSkull'] },
    inactivePlayer: { board: ['haunt', 'bookOfAsh'] },
    phase: 'act',
  })
  const [attackerPlayerId, defenderPlayerId] = initialState.playerOrder
  const [attackerId, instanceAttackerId] =
    initialState.players[attackerPlayerId].board
  const [defenderId, instanceDefenderId] =
    initialState.players[defenderPlayerId].board
  const stunnedState = structuredClone(initialState)

  if (stunnedState.cards[attackerId].type !== 'character') {
    throw new Error('Expected a character attacker')
  }
  stunnedState.cards[attackerId].turnsStunned = 1

  expect(
    duelReducer(stunnedState, attackCharacter({ attackerId, defenderId })),
  ).toEqual(stunnedState)
  expect(
    duelReducer(
      initialState,
      attackCharacter({ attackerId: defenderId, defenderId: attackerId }),
    ),
  ).toEqual(initialState)
  expect(
    duelReducer(
      initialState,
      attackCharacter({ attackerId: instanceAttackerId, defenderId }),
    ),
  ).toEqual(initialState)
  expect(
    duelReducer(
      initialState,
      attackCharacter({ attackerId, defenderId: instanceDefenderId }),
    ),
  ).toEqual(initialState)

  const attackedState = duelReducer(
    initialState,
    attackCharacter({ attackerId, defenderId }),
  )
  expect(
    duelReducer(attackedState, attackCharacter({ attackerId, defenderId })),
  ).toEqual(attackedState)
})

test('discards defeated characters and restores all base combat stats', () => {
  const initialState = setupMockedDuel({
    activePlayer: { board: 'templeGuard' },
    inactivePlayer: { board: 'zombie' },
    phase: 'act',
  })
  const [attackerPlayerId, defenderPlayerId] = initialState.playerOrder
  const attackerId = initialState.players[attackerPlayerId].board[0]
  const defenderId = initialState.players[defenderPlayerId].board[0]
  const preparedState = structuredClone(initialState)

  if (preparedState.cards[defenderId].type !== 'character') {
    throw new Error('Expected a character defender')
  }
  Object.assign(preparedState.cards[defenderId], {
    cost: 9,
    life: 1,
    strength: 7,
    turnsStunned: 3,
    didAct: true,
  })

  const state = duelReducer(
    preparedState,
    attackCharacter({ attackerId, defenderId }),
  )

  expect(state.players[defenderPlayerId].board).toEqual([])
  expect(state.players[defenderPlayerId].discard).toEqual([defenderId])
  expect(state.cards[defenderId]).toMatchObject({
    stack: 'discard',
    cost: 1,
    life: 1,
    strength: DEFAULT_CHARACTER_STRENGTH,
    turnsStunned: 0,
    didAct: false,
  })
})

test('hands act control to the second player before entering refresh', () => {
  const initialState = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    phase: 'act',
  })
  const [firstPlayerId, secondPlayerId] = initialState.playerOrder

  const firstPassed = duelReducer(initialState, passActTurn())
  const secondTurn = duelReducer(firstPassed, completeActTurn())

  expect(secondTurn.phase).toBe('act')
  expect(secondTurn.actPlayerId).toBe(secondPlayerId)
  expect(secondTurn.playerOrder).toEqual([secondPlayerId, firstPlayerId])

  const secondPassed = duelReducer(secondTurn, passActTurn())
  const refreshState = duelReducer(secondPassed, completeActTurn())

  expect(refreshState.phase).toBe('refresh')
  expect(refreshState.actPlayerId).toBeNull()
  expect(refreshState.playerOrder).toEqual([secondPlayerId, firstPlayerId])
})

test('ignores act pass and completion without a valid acting player', () => {
  const initialState = setupMockedDuel({
    activePlayer: { board: 'novice' },
    phase: 'act',
  })
  const missingActorState = { ...initialState, actPlayerId: null }

  expect(duelReducer(missingActorState, passActTurn())).toEqual(
    missingActorState,
  )
  expect(duelReducer(missingActorState, completeActTurn())).toEqual(
    missingActorState,
  )

  expect(duelReducer(initialState, completeActTurn())).toEqual(initialState)

  const alreadyPassedState = structuredClone(initialState)
  const actingPlayerId = alreadyPassedState.actPlayerId

  if (!actingPlayerId) throw new Error('Expected an acting player')

  alreadyPassedState.players[actingPlayerId].hasActedThisPhase = true
  expect(duelReducer(alreadyPassedState, passActTurn())).toEqual(
    alreadyPassedState,
  )
})

test('refreshes stats and income, keeps the rotated initiative, then draws for both players', () => {
  const initialState = setupMockedDuel({
    activePlayer: {
      coins: 2,
      income: 1,
      board: ['novice', 'yoraSkull'],
      deck: 'acolyte',
    },
    inactivePlayer: { coins: 3, income: 0, board: 'zombie', deck: 'haunt' },
    phase: 'refresh',
  })
  const [firstPlayerId, secondPlayerId] = initialState.playerOrder
  const firstCardId = initialState.players[firstPlayerId].board[0]
  const preparedState = structuredClone(initialState)

  if (preparedState.cards[firstCardId].type !== 'character') {
    throw new Error('Expected a character')
  }
  preparedState.cards[firstCardId].didAct = true
  preparedState.cards[firstCardId].turnsStunned = 2

  const refreshedState = duelReducer(preparedState, completeRefresh())

  expect(refreshedState).toMatchObject({
    round: 1,
    phase: 'draw',
    playerOrder: [firstPlayerId, secondPlayerId],
  })
  expect(refreshedState.players[firstPlayerId].coins).toBe(2 + INCOME_PER_TURN)
  expect(refreshedState.players[secondPlayerId].coins).toBe(3)
  expect(refreshedState.cards[firstCardId]).toMatchObject({
    didAct: false,
    turnsStunned: 2,
  })

  const drawnState = duelReducer(refreshedState, drawForPlayers())

  expect(drawnState.phase).toBe('play')
  expect(drawnState.players[firstPlayerId].hand).toHaveLength(1)
  expect(drawnState.players[secondPlayerId].hand).toHaveLength(1)
})

test('ignores refresh completion outside the refresh phase', () => {
  const state = setupMockedDuel({ phase: 'act' })

  expect(duelReducer(state, completeRefresh())).toEqual(state)
})
