import { FLASH_BOMB_STUN_TURNS } from '../../cards/bases/neutralConstants'
import { createAppStore } from '../../redux'
import { setupMockedDuel } from '../../user'
import { completePlayTurn, playCard } from '../state'
import { selectCardEffectTarget } from './targetedCardEffect'

test('Cook draws one card on play using the normal draw action', () => {
  const initialState = setupMockedDuel({
    activePlayer: { coins: 3, deck: 'novice', hand: 'cook' },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const cookId = initialState.players[playerId].hand[0]
  const drawnCardId = initialState.players[playerId].deck[0]
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({ playerId, cardInstanceId: cookId, cardBaseId: 'cook' }),
  )

  expect(store.getState().duel.players[playerId]).toMatchObject({
    deck: [],
    hand: [drawnCardId],
    board: [cookId],
  })
})

test('Cook safely draws from an empty deck', () => {
  const initialState = setupMockedDuel({
    activePlayer: { coins: 3, hand: 'cook' },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const cookId = initialState.players[playerId].hand[0]
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({ playerId, cardInstanceId: cookId, cardBaseId: 'cook' }),
  )

  expect(store.getState().duel.players[playerId]).toMatchObject({
    deck: [],
    hand: [],
    board: [cookId],
  })
})

test('Speed Potion grants persistent Haste to an allied character in hand', () => {
  const initialState = setupMockedDuel({
    activePlayer: { coins: 3, hand: ['speedPotion', 'burrick'] },
    phase: 'play',
  })
  const playerId = initialState.playerOrder[0]
  const [potionId, targetId] = initialState.players[playerId].hand
  const store = createAppStore(initialState)

  store.dispatch(
    playCard({
      playerId,
      cardInstanceId: potionId,
      cardBaseId: 'speedPotion',
    }),
  )
  store.dispatch(selectCardEffectTarget({ targetCardInstanceId: targetId }))

  const state = store.getState().duel

  expect(state.cards[targetId]).toMatchObject({
    stack: 'hand',
    traits: { charges: 1, haste: true },
  })
  expect(state.cards[potionId]).toMatchObject({ stack: 'discard' })
  expect(state.pendingPlayedCardId).toBeNull()
})

test('Flash Bomb strips every existing trait before applying its stun', () => {
  const initialState = setupMockedDuel({
    activePlayer: { coins: 5, hand: 'flashBomb' },
    inactivePlayer: { board: 'burrick' },
    phase: 'play',
  })
  const [playerId, opponentId] = initialState.playerOrder
  const bombId = initialState.players[playerId].hand[0]
  const targetId = initialState.players[opponentId].board[0]
  const target = initialState.cards[targetId]

  if (target.type !== 'character') throw new Error('Expected a character')

  target.traits = { charges: 4, haste: true, stunned: 3 }
  target.didAct = true

  const store = createAppStore(initialState)

  store.dispatch(
    playCard({ playerId, cardInstanceId: bombId, cardBaseId: 'flashBomb' }),
  )
  store.dispatch(selectCardEffectTarget({ targetCardInstanceId: targetId }))
  store.dispatch(completePlayTurn())

  expect(store.getState().duel.cards[targetId]).toMatchObject({
    life: 2,
    strength: 1,
    didAct: true,
    traits: { stunned: FLASH_BOMB_STUN_TURNS },
  })
  expect(store.getState().duel.cards[bombId]).toMatchObject({
    stack: 'discard',
  })
})
