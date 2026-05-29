import type { UnknownAction } from '@reduxjs/toolkit'

import { activateCharacterAbility } from 'src/game-engine/duel'
import {
  makeTestCard,
  makeTestDuel,
  makeTestPlayer,
} from 'src/game-engine/testing'
import type { CardAttributes, CardBaseId, Duel } from 'src/game-engine/types'
import { makeStore } from 'src/store'

const testCard = (
  baseId: CardBaseId,
  id: string,
  attributes?: Partial<CardAttributes>,
) => makeTestCard(baseId, id, { attributes })

const dispatchWithEffects = (state: Duel, action: UnknownAction): Duel => {
  const store = makeStore(state)
  store.dispatch(action)
  return store.getState().duel
}

describe('Character ability middleware', () => {
  test('arms burrick ability on first activation', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      cards: {
        b1: testCard('burrick', 'b1', { charges: 1 }),
        t1: testCard('templeGuard', 't1'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['b1'],
        }),
        player2: makeTestPlayer('player2', {
          board: ['t1'],
        }),
      },
    })

    const result = dispatchWithEffects(
      state,
      activateCharacterAbility({ cardInstanceId: 'b1' }),
    )

    expect(result.pendingCharacterAbility).toEqual({
      sourceCardInstanceId: 'b1',
      sourceCardBaseId: 'burrick',
    })
  })

  test('resolves burrick ability on target activation and clears pending state', () => {
    const state = makeTestDuel({
      phase: 'player-turn',
      pendingCharacterAbility: {
        sourceCardInstanceId: 'b1',
        sourceCardBaseId: 'burrick',
      },
      cards: {
        b1: testCard('burrick', 'b1', { charges: 1 }),
        z1: testCard('zombie', 'z1'),
        t1: testCard('templeGuard', 't1'),
        z2: testCard('zombie', 'z2'),
      },
      players: {
        player1: makeTestPlayer('player1', {
          board: ['b1'],
          discard: [],
        }),
        player2: makeTestPlayer('player2', {
          board: ['z1', 't1', 'z2'],
          discard: [],
        }),
      },
    })

    const result = dispatchWithEffects(
      state,
      activateCharacterAbility({ cardInstanceId: 't1' }),
    )

    expect(result.pendingCharacterAbility).toBeNull()
    expect(result.cards['b1']!.attributes.charges).toBe(0)
    expect(result.cards['b1']!.attributes.life).toBe(3)
    expect(result.players['player2'].board).toContain('z1')
    expect(result.players['player2'].board).toContain('z2')
    expect(result.cards['z1']!.attributes.life).toBe(1)
    expect(result.cards['z2']!.attributes.life).toBe(1)
  })
})
