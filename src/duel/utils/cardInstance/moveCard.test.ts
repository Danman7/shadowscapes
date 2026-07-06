import { setupMockedDuel } from '../../../user'
import type { CharacterCardInstance } from '../../types'
import { moveCard } from './moveCard'
import { reduceTurnsStunned } from './reduceTurnsStunned'

test('moves one card by default and supports moving an amount', () => {
  const state = setupMockedDuel({
    activePlayer: { deck: ['novice', 'acolyte', 'templeGuard'] },
  })
  const playerId = state.playerOrder[0]
  const player = state.players[playerId]
  const firstCardId = player.deck[0]

  expect(moveCard({ state, playerId, from: 'deck', to: 'hand' })).toEqual([
    firstCardId,
  ])
  expect(player.hand).toEqual([firstCardId])

  const remainingCardIds = [...player.deck]
  expect(
    moveCard({
      state,
      playerId,
      from: 'deck',
      to: 'hand',
      amount: 2,
    }),
  ).toEqual(remainingCardIds)
  expect(player.hand).toEqual([firstCardId, ...remainingCardIds])
})

test('moves a targeted character to the board and stuns it', () => {
  const state = setupMockedDuel({ activePlayer: { hand: 'novice' } })
  const playerId = state.playerOrder[0]
  const cardId = state.players[playerId].hand[0]

  expect(
    moveCard({
      state,
      playerId,
      cardId,
      from: 'hand',
      to: 'board',
    }),
  ).toEqual([cardId])
  expect(state.players[playerId].hand).toEqual([])
  expect(state.players[playerId].board).toEqual([cardId])
  expect(state.cards[cardId]).toMatchObject({
    stack: 'board',
    turnsStunned: 1,
    didAct: false,
  })
})

test('resets a character when moving it to discard', () => {
  const state = setupMockedDuel({ activePlayer: { board: 'novice' } })
  const playerId = state.playerOrder[0]
  const cardId = state.players[playerId].board[0]
  const card = state.cards[cardId]

  if (card.type !== 'character') throw new Error('Expected a character')

  Object.assign(card, {
    cost: 9,
    life: 8,
    strength: 7,
    turnsStunned: 2,
    didAct: true,
  })

  expect(
    moveCard({
      state,
      playerId,
      cardId,
      from: 'board',
      to: 'discard',
    }),
  ).toEqual([cardId])
  expect(card).toMatchObject({
    stack: 'discard',
    cost: 1,
    life: 1,
    strength: 1,
    turnsStunned: 0,
    didAct: false,
  })
})

test('rejects missing cards, missing players, and ownership mismatches', () => {
  const state = setupMockedDuel({ activePlayer: { hand: 'novice' } })
  const [playerId, otherPlayerId] = state.playerOrder
  const cardId = state.players[playerId].hand[0]

  expect(
    moveCard({
      state,
      playerId,
      cardId: 'missing',
      from: 'hand',
      to: 'board',
    }),
  ).toEqual([])
  expect(
    moveCard({
      state,
      playerId: 'missing',
      from: 'hand',
      to: 'board',
    }),
  ).toEqual([])

  state.players[otherPlayerId].hand.push(cardId)
  expect(
    moveCard({
      state,
      playerId: otherPlayerId,
      cardId,
      from: 'hand',
      to: 'board',
    }),
  ).toEqual([])
  expect(state.cards[cardId].stack).toBe('hand')
})

test('rejects moving a corrupted character with a non-character base to discard', () => {
  const state = setupMockedDuel({ activePlayer: { board: 'yoraSkull' } })
  const playerId = state.playerOrder[0]
  const cardId = state.players[playerId].board[0]
  const instance = state.cards[cardId]

  state.cards[cardId] = {
    ...instance,
    type: 'character',
    life: 1,
    strength: 1,
    turnsStunned: 0,
    didAct: false,
  } as CharacterCardInstance

  expect(
    moveCard({
      state,
      playerId,
      cardId,
      from: 'board',
      to: 'discard',
    }),
  ).toEqual([])
  expect(state.players[playerId].board).toEqual([cardId])
})

test('does not move cards to the stack they already occupy', () => {
  const state = setupMockedDuel({ activePlayer: { hand: 'novice' } })
  const playerId = state.playerOrder[0]

  expect(moveCard({ state, playerId, from: 'hand', to: 'hand' })).toEqual([])
})

test('decrements positive stun without going below zero', () => {
  const state = setupMockedDuel({ activePlayer: { board: 'novice' } })
  const playerId = state.playerOrder[0]
  const card = state.cards[state.players[playerId].board[0]]

  if (card.type !== 'character') throw new Error('Expected a character')

  card.turnsStunned = 2
  reduceTurnsStunned(card)
  expect(card.turnsStunned).toBe(1)

  card.turnsStunned = 0
  reduceTurnsStunned(card)
  expect(card.turnsStunned).toBe(0)
})
