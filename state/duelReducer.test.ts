import { mockChaosUser, mockOrderUser } from '@/mocks'
import {
  DuelPhases,
  INITIAL_DUEL_PLAYER_COINS,
  initialDuelState,
} from '@/state/duelConstants'
import { duelReducer } from '@/state/duelReducer'
import { DuelAction, StartDuelAction, StartInitialDrawAction } from '@/types'

it('should return current state for unknown actions', () => {
  const action = { type: 'UNKNOWN_ACTION' } as unknown as DuelAction

  const newState = duelReducer(initialDuelState, action)

  expect(newState).toBe(initialDuelState)
})

it('should convert users to players and reset state when START_DUEL is dispatched', () => {
  const action: StartDuelAction = {
    type: 'START_DUEL',
    players: [mockOrderUser, mockChaosUser],
  }

  const { players, cards, zones, cardZone } = duelReducer(
    initialDuelState,
    action,
  )

  expect(players.Player1).toEqual({
    id: 'Player1',
    name: mockOrderUser.name,
    userId: mockOrderUser.id,
    coins: INITIAL_DUEL_PLAYER_COINS,
    hasPerformedAction: false,
  })

  expect(players.Player2).toEqual({
    id: 'Player2',
    name: mockChaosUser.name,
    userId: mockChaosUser.id,
    coins: INITIAL_DUEL_PLAYER_COINS,
    hasPerformedAction: false,
  })

  mockOrderUser.deck.forEach((definitionId) => {
    expect(Object.values(cards)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          definitionId,
          ownerId: 'Player1',
        }),
      ]),
    )
  })

  mockChaosUser.deck.forEach((definitionId) => {
    expect(Object.values(cards)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          definitionId,
          ownerId: 'Player2',
        }),
      ]),
    )
  })

  const player1Deck = zones['Player1:Deck']
  const player2Deck = zones['Player2:Deck']

  expect(player1Deck.length).toBe(mockOrderUser.deck.length)
  expect(player2Deck.length).toBe(mockChaosUser.deck.length)

  for (const id of player1Deck) {
    expect(cards[id]).toBeDefined()
    expect(cards[id].ownerId).toBe('Player1')
    expect(cardZone[id]).toBe('Player1:Deck')
  }

  for (const id of player2Deck) {
    expect(cards[id]).toBeDefined()
    expect(cards[id].ownerId).toBe('Player2')
    expect(cardZone[id]).toBe('Player2:Deck')
  }
})

it('should handle START_INITIAL_DRAW action', () => {
  const action: StartInitialDrawAction = { type: 'START_INITIAL_DRAW' }

  const { phase } = duelReducer(initialDuelState, action)

  expect(phase).toEqual(DuelPhases.InitialDraw)
})
