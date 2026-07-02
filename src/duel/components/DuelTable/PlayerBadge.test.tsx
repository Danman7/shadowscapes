import { render, screen } from '@testing-library/react'

import { mockOrderPlayer } from '../../state'
import { PlayerBadge } from './PlayerBadge'

test('displays the player name and coins', () => {
  render(<PlayerBadge player={mockOrderPlayer} />)

  expect(screen.getByText(mockOrderPlayer.name)).toBeInTheDocument()
  expect(screen.getByText(mockOrderPlayer.coins)).toBeInTheDocument()
})

test('displays the active-player indicator only when active', () => {
  const { container, rerender } = render(
    <PlayerBadge player={mockOrderPlayer} isActive />,
  )

  expect(container.querySelector('.animate-ping')).toBeInTheDocument()

  rerender(<PlayerBadge player={mockOrderPlayer} />)

  expect(container.querySelector('.animate-ping')).not.toBeInTheDocument()
})
