import { mockChaosUser, mockOrderUser, setupMockedDuel } from '../../user'
import {
  getPreferredRandomAiAttackPairs,
  getPreferredRandomAiEffectTargetIds,
  getPreferredRandomAiPlayableCardIds,
  getRandomAiAttackPairs,
  getRandomAiPlayableCardIds,
} from './randomAi'

const soloMode = {
  type: 'solo-random-ai',
  humanPlayerId: mockOrderUser.id,
  aiPlayerId: mockChaosUser.id,
} as const

test('finds only playable AI cards within coins and target rules', () => {
  const state = setupMockedDuel({
    inactivePlayer: {
      coins: 3,
      hand: ['zombie', 'bookOfAsh', 'yoraSkull', 'haunt'],
    },
    mode: soloMode,
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  const playableBaseIds = getRandomAiPlayableCardIds(
    state,
    mockChaosUser.id,
  ).map((cardId) => state.cards[cardId].baseId)

  expect(playableBaseIds).toEqual(['zombie', 'haunt'])
})

test('returns no playable AI cards for a missing player', () => {
  expect(getRandomAiPlayableCardIds(setupMockedDuel(), 'missing')).toEqual([])
})

test('falls back to legal plays when the player has no resolvable opponent', () => {
  const duplicateOrderState = setupMockedDuel({
    activePlayer: { coins: 1, hand: 'novice' },
    phase: 'play',
  })
  const playerId = duplicateOrderState.playerOrder[0]

  duplicateOrderState.playerOrder = [playerId, playerId]

  expect(
    getPreferredRandomAiPlayableCardIds(duplicateOrderState, playerId),
  ).toEqual(getRandomAiPlayableCardIds(duplicateOrderState, playerId))

  const missingOpponentState = setupMockedDuel({
    activePlayer: { coins: 1, hand: 'novice' },
    phase: 'play',
  })
  const missingOpponentPlayerId = missingOpponentState.playerOrder[1]

  delete missingOpponentState.players[missingOpponentPlayerId]

  expect(
    getPreferredRandomAiPlayableCardIds(
      missingOpponentState,
      mockOrderUser.id,
    ),
  ).toEqual(getRandomAiPlayableCardIds(missingOpponentState, mockOrderUser.id))
  expect(
    getPreferredRandomAiPlayableCardIds(missingOpponentState, 'missing'),
  ).toEqual([])
})

test("prioritizes Saint Yora's Skull when it can buff three characters", () => {
  const state = setupMockedDuel({
    activePlayer: {
      coins: 4,
      hand: ['templeGuard', 'yoraSkull'],
      board: ['novice', 'acolyte', 'templeGuard'],
    },
    inactivePlayer: { board: ['zombie', 'zombie', 'haunt', 'burrick'] },
    phase: 'play',
  })

  expect(
    getPreferredRandomAiPlayableCardIds(state, mockOrderUser.id).map(
      (cardId) => state.cards[cardId].baseId,
    ),
  ).toEqual(['yoraSkull'])
})

test('prioritizes Book of Ash when a Zombie is in discard', () => {
  const state = setupMockedDuel({
    inactivePlayer: {
      coins: 4,
      hand: ['burrick', 'bookOfAsh'],
      discard: 'zombie',
    },
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  expect(
    getPreferredRandomAiPlayableCardIds(state, mockChaosUser.id).map(
      (cardId) => state.cards[cardId].baseId,
    ),
  ).toEqual(['bookOfAsh'])
})

test('prioritizes Burrick over other characters when three targets align', () => {
  const state = setupMockedDuel({
    activePlayer: { board: ['novice', 'acolyte', 'templeGuard'] },
    inactivePlayer: { coins: 3, hand: ['zombie', 'burrick'] },
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  expect(
    getPreferredRandomAiPlayableCardIds(state, mockChaosUser.id).map(
      (cardId) => state.cards[cardId].baseId,
    ),
  ).toEqual(['burrick'])
})

test('prioritizes all playable characters over ordinary valid instances', () => {
  const state = setupMockedDuel({
    activePlayer: {
      coins: 4,
      hand: ['novice', 'acolyte', 'yoraSkull'],
      board: 'templeGuard',
    },
    phase: 'play',
  })

  expect(
    getPreferredRandomAiPlayableCardIds(state, mockOrderUser.id).map(
      (cardId) => state.cards[cardId].baseId,
    ),
  ).toEqual(['novice', 'acolyte'])
})

test('falls back to a valid instance when no character is playable', () => {
  const state = setupMockedDuel({
    activePlayer: {
      coins: 4,
      hand: 'yoraSkull',
      board: 'novice',
    },
    phase: 'play',
  })

  expect(
    getPreferredRandomAiPlayableCardIds(state, mockOrderUser.id).map(
      (cardId) => state.cards[cardId].baseId,
    ),
  ).toEqual(['yoraSkull'])
})

test('returns no preferred effect targets without a resolvable pending card', () => {
  const state = setupMockedDuel({
    activePlayer: { board: ['novice', 'yoraSkull'] },
    phase: 'play',
  })
  const missingPendingCardState = structuredClone(state)

  missingPendingCardState.pendingPlayedCardId = 'missing'

  expect(getPreferredRandomAiEffectTargetIds(state)).toEqual([])
  expect(getPreferredRandomAiEffectTargetIds(missingPendingCardState)).toEqual(
    [],
  )
})

test("prefers Saint Yora's Skull interior targets when the opponent outnumbers", () => {
  const state = setupMockedDuel({
    activePlayer: {
      board: ['novice', 'acolyte', 'templeGuard', 'yoraSkull'],
    },
    inactivePlayer: { board: ['zombie', 'zombie', 'haunt', 'burrick'] },
    phase: 'play',
  })
  const player = state.players[mockOrderUser.id]

  state.pendingPlayedCardId = player.board[3]

  expect(getPreferredRandomAiEffectTargetIds(state)).toEqual([player.board[1]])
})

test("falls back to any valid Saint Yora's Skull target without a triple buff", () => {
  const state = setupMockedDuel({
    activePlayer: { board: ['novice', 'yoraSkull'] },
    phase: 'play',
  })
  const player = state.players[mockOrderUser.id]

  state.pendingPlayedCardId = player.board[1]

  expect(getPreferredRandomAiEffectTargetIds(state)).toEqual([player.board[0]])
})

test("falls back to valid Saint Yora's Skull targets without an opponent", () => {
  const state = setupMockedDuel({
    activePlayer: {
      board: ['novice', 'acolyte', 'templeGuard', 'yoraSkull'],
    },
    phase: 'play',
  })
  const player = state.players[mockOrderUser.id]

  state.pendingPlayedCardId = player.board[3]
  state.playerOrder = [mockOrderUser.id, mockOrderUser.id]

  expect(getPreferredRandomAiEffectTargetIds(state)).toEqual(
    player.board.slice(0, 3),
  )
})

test('prefers every discarded Zombie as a Book of Ash target', () => {
  const state = setupMockedDuel({
    activePlayer: {
      board: 'bookOfAsh',
      discard: ['haunt', 'zombie', 'zombie'],
    },
    phase: 'play',
  })
  const player = state.players[mockOrderUser.id]

  state.pendingPlayedCardId = player.board[0]

  expect(getPreferredRandomAiEffectTargetIds(state)).toEqual([
    player.discard[1],
    player.discard[2],
  ])
})

test('falls back to another valid Book of Ash target without Zombies', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'bookOfAsh', discard: 'haunt' },
    phase: 'play',
  })
  const player = state.players[mockOrderUser.id]

  state.pendingPlayedCardId = player.board[0]

  expect(getPreferredRandomAiEffectTargetIds(state)).toEqual(player.discard)
})

test('finds valid random AI attack pairs', () => {
  const state = setupMockedDuel({
    activePlayer: { board: ['novice', 'yoraSkull'] },
    inactivePlayer: { board: ['zombie', 'bookOfAsh'] },
    mode: soloMode,
    phase: 'act',
  })

  state.actPlayerId = mockChaosUser.id

  expect(getRandomAiAttackPairs(state, mockChaosUser.id)).toEqual([
    {
      attackerId: state.players[mockChaosUser.id].board[0],
      defenderId: state.players[mockOrderUser.id].board[0],
    },
  ])
})

test('prioritizes a charged Burrick three-target attack over an ordinary kill', () => {
  const state = setupMockedDuel({
    activePlayer: { board: ['burrick', 'templeGuard'] },
    inactivePlayer: { board: ['haunt', 'templeGuard', 'zombie'] },
    phase: 'act',
  })
  const activePlayer = state.players[mockOrderUser.id]
  const opponent = state.players[mockChaosUser.id]

  expect(getPreferredRandomAiAttackPairs(state, mockOrderUser.id)).toEqual([
    {
      attackerId: activePlayer.board[0],
      defenderId: opponent.board[1],
    },
  ])
})

test('prefers a directly lethal target within Burrick splash attacks', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'burrick' },
    inactivePlayer: {
      board: ['haunt', 'zombie', 'templeGuard', 'haunt'],
    },
    phase: 'act',
  })
  const activePlayer = state.players[mockOrderUser.id]
  const opponent = state.players[mockChaosUser.id]

  expect(getPreferredRandomAiAttackPairs(state, mockOrderUser.id)).toEqual([
    {
      attackerId: activePlayer.board[0],
      defenderId: opponent.board[1],
    },
  ])
})

test('prioritizes every directly lethal ordinary attack', () => {
  const state = setupMockedDuel({
    activePlayer: { board: ['novice', 'templeGuard'] },
    inactivePlayer: { board: ['haunt', 'zombie'] },
    phase: 'act',
  })
  const opponent = state.players[mockChaosUser.id]

  expect(
    getPreferredRandomAiAttackPairs(state, mockOrderUser.id).map(
      ({ defenderId }) => defenderId,
    ),
  ).toEqual([opponent.board[1], opponent.board[1]])
})

test('falls back to every legal attack when none are lethal', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'haunt' },
    phase: 'act',
  })

  expect(getPreferredRandomAiAttackPairs(state, mockOrderUser.id)).toEqual(
    getRandomAiAttackPairs(state, mockOrderUser.id),
  )
})

test('returns no AI attack pairs outside the active act turn', () => {
  const state = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    mode: soloMode,
    phase: 'play',
  })

  expect(getRandomAiAttackPairs(state, mockChaosUser.id)).toEqual([])

  const wrongActorState = { ...state, phase: 'act' as const }

  wrongActorState.actPlayerId = mockOrderUser.id

  expect(getRandomAiAttackPairs(wrongActorState, mockChaosUser.id)).toEqual([])
})

test('returns no AI attack pairs without both attacker and opponent players', () => {
  const missingPlayerState = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    mode: soloMode,
    phase: 'act',
  })

  missingPlayerState.actPlayerId = 'missing'

  expect(getRandomAiAttackPairs(missingPlayerState, 'missing')).toEqual([])

  const missingOpponentState = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    mode: soloMode,
    phase: 'act',
  })

  missingOpponentState.actPlayerId = mockChaosUser.id
  delete missingOpponentState.players[mockOrderUser.id]

  expect(getRandomAiAttackPairs(missingOpponentState, mockChaosUser.id)).toEqual(
    [],
  )

  const missingOpponentIdState = setupMockedDuel({
    activePlayer: { board: 'novice' },
    inactivePlayer: { board: 'zombie' },
    mode: soloMode,
    phase: 'act',
  })

  missingOpponentIdState.playerOrder = [mockChaosUser.id, mockChaosUser.id]
  missingOpponentIdState.actPlayerId = mockChaosUser.id

  expect(
    getRandomAiAttackPairs(missingOpponentIdState, mockChaosUser.id),
  ).toEqual([])
})
