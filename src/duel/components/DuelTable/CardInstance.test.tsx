import { render, screen } from '@testing-library/react'

import { setupMockedDuel } from '../../../user'
import { DuelProvider } from '../DuelProvider/DuelProvider'
import { CardInstance } from './CardInstance'
import { CombatInteractionProvider } from './CombatInteractionProvider'

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
