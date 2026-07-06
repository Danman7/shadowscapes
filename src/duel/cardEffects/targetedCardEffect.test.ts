import { setupMockedDuel } from '../../user'
import { resolvePendingPlayedCard } from '../state'
import {
  createTargetedCardEffect,
  selectCardEffectTarget,
} from './targetedCardEffect'

test('targeted card effects ignore unrelated actions', () => {
  const duel = setupMockedDuel({
    activePlayer: { board: ['novice', 'yoraSkull'] },
    phase: 'play',
  })
  const playerId = duel.playerOrder[0]
  const [, skullId] = duel.players[playerId].board
  const effect = vi.fn()
  const registration = createTargetedCardEffect('yoraSkull', effect)
  const dispatch = vi.fn()

  duel.pendingPlayedCardId = skullId

  registration.run({
    action: { type: 'duel/unrelatedAction' },
    previousState: { duel },
    state: { duel },
    dispatch,
    getState: () => ({ duel }),
  })

  expect(effect).not.toHaveBeenCalled()
  expect(dispatch).not.toHaveBeenCalled()
})

test('targeted card effects ignore selections without a pending card', () => {
  const duel = setupMockedDuel({
    activePlayer: { board: 'novice' },
    phase: 'play',
  })
  const playerId = duel.playerOrder[0]
  const targetCardInstanceId = duel.players[playerId].board[0]
  const effect = vi.fn()
  const registration = createTargetedCardEffect('yoraSkull', effect)
  const dispatch = vi.fn()

  registration.run({
    action: selectCardEffectTarget({ targetCardInstanceId }),
    previousState: { duel },
    state: { duel },
    dispatch,
    getState: () => ({ duel }),
  })

  expect(effect).not.toHaveBeenCalled()
  expect(dispatch).not.toHaveBeenCalled()
})

test('targeted card effects ignore selections for a different pending card', () => {
  const duel = setupMockedDuel({
    activePlayer: { board: ['novice', 'bookOfAsh'] },
    phase: 'play',
  })
  const playerId = duel.playerOrder[0]
  const [targetCardInstanceId, bookId] = duel.players[playerId].board
  const effect = vi.fn()
  const registration = createTargetedCardEffect('yoraSkull', effect)
  const dispatch = vi.fn()

  duel.pendingPlayedCardId = bookId

  registration.run({
    action: selectCardEffectTarget({ targetCardInstanceId }),
    previousState: { duel },
    state: { duel },
    dispatch,
    getState: () => ({ duel }),
  })

  expect(effect).not.toHaveBeenCalled()
  expect(dispatch).not.toHaveBeenCalled()
})

test('targeted card effects run and resolve the pending card for a valid selection', () => {
  const duel = setupMockedDuel({
    activePlayer: { board: ['novice', 'yoraSkull'] },
    phase: 'play',
  })
  const playerId = duel.playerOrder[0]
  const [targetCardInstanceId, skullId] = duel.players[playerId].board
  const effect = vi.fn()
  const registration = createTargetedCardEffect('yoraSkull', effect)
  const dispatch = vi.fn()

  duel.pendingPlayedCardId = skullId

  registration.run({
    action: selectCardEffectTarget({ targetCardInstanceId }),
    previousState: { duel },
    state: { duel },
    dispatch,
    getState: () => ({ duel }),
  })

  expect(effect).toHaveBeenCalledWith(
    expect.objectContaining({
      cardInstanceId: skullId,
      targetCardInstanceId,
    }),
  )
  expect(dispatch).toHaveBeenCalledWith(
    resolvePendingPlayedCard({ cardInstanceId: skullId }),
  )
})
