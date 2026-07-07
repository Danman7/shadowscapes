import { render, screen } from '@testing-library/react'

import { mockOrderPlayer } from '../../state'
import { PlayerBadge } from './PlayerBadge'

test('displays the player name, coins and income', () => {
  const income = 5

  render(<PlayerBadge player={{ ...mockOrderPlayer, income }} />)

  expect(screen.getByText(mockOrderPlayer.name)).toBeInTheDocument()
  expect(screen.getByText(String(mockOrderPlayer.coins))).toBeInTheDocument()
  expect(screen.getByText(`+${income}`)).toBeInTheDocument()
})

test('displays the active-player indicator only when active', () => {
  const { container, rerender } = render(
    <PlayerBadge player={mockOrderPlayer} isActive />,
  )

  expect(container.querySelector('.animate-ping')).toBeInTheDocument()

  rerender(<PlayerBadge player={mockOrderPlayer} />)

  expect(container.querySelector('.animate-ping')).not.toBeInTheDocument()
})
