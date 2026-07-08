import { render, screen } from '@testing-library/react'

import { mockChaosUser, mockOrderUser, setupMockedDuel } from '../../../user'
import { DuelProvider } from '../DuelProvider/DuelProvider'
import { CardInstance } from './CardInstance'
import { CombatInteractionProvider } from './CombatInteractionProvider'

const soloMode = {
  type: 'solo-random-ai',
  humanPlayerId: mockOrderUser.id,
  aiPlayerId: mockChaosUser.id,
} as const

test('does not make a face-up card outside the hand or board interactive', () => {
  const state = setupMockedDuel({ activePlayer: { discard: 'novice' } })
  const playerId = state.playerOrder[0]
  const instance = state.cards[state.players[playerId].discard[0]]

  render(
    <DuelProvider preloadedState={state}>
      <CombatInteractionProvider>
        <CardInstance instance={instance} />
      </CombatInteractionProvider>
    </DuelProvider>,
  )

  expect(screen.getByRole('article', { name: 'Novice card' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Novice card' })).toBeNull()
})

test('does not make AI-owned hand cards manually interactive in solo mode', () => {
  const state = setupMockedDuel({
    inactivePlayer: { hand: 'zombie' },
    mode: soloMode,
    phase: 'play',
  })

  state.playerOrder = [mockChaosUser.id, mockOrderUser.id]

  const instance = state.cards[state.players[mockChaosUser.id].hand[0]]

  render(
    <DuelProvider preloadedState={state}>
      <CombatInteractionProvider>
        <CardInstance instance={instance} />
      </CombatInteractionProvider>
    </DuelProvider>,
  )

  expect(screen.getByRole('article', { name: 'Zombie card' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Zombie card' })).toBeNull()
})
