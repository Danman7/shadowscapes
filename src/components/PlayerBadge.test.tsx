import { render } from '@testing-library/react'
import { expect, test } from 'vitest'

import { PlayerBadge } from '@/components/PlayerBadge'
import { PLACEHOLDER_PLAYER } from '@/constants/duelParams'
import type { Player } from '@/types'

const player: Player = {
  ...PLACEHOLDER_PLAYER,
  id: 'player1',
  name: 'Player Name',
}

test('renders player info', () => {
  const { getByText } = render(<PlayerBadge player={player} />)

  expect(getByText(player.name)).toBeInTheDocument()
  expect(getByText(player.coins)).toBeInTheDocument()
})

test('renders player is ready', () => {
  const { getByText } = render(
    <PlayerBadge player={{ ...player, playerReady: true }} />,
  )

  expect(getByText('Ready')).toBeInTheDocument()
})

test('renders without active indicator when isActive is false', () => {
  const { container } = render(<PlayerBadge player={player} />)

  const badge = container.querySelector('.name-tag')
  expect(badge).toBeInTheDocument()
  expect(badge).toHaveClass('top-2')
  expect(badge).not.toHaveClass('border-primary')
  expect(badge).not.toHaveClass('bottom-2')

  const pingIndicator = container.querySelector('.animate-ping')
  expect(pingIndicator).not.toBeInTheDocument()
})

test('renders with active indicator when isActive is true', () => {
  const { container } = render(<PlayerBadge player={player} isActive />)

  const badge = container.querySelector('.name-tag')
  expect(badge).toBeInTheDocument()
  expect(badge).toHaveClass('border-primary')
  expect(badge).toHaveClass('bottom-2')
  expect(badge).not.toHaveClass('top-2')

  const pingIndicators = container.querySelectorAll('.animate-ping')
  expect(pingIndicators).toHaveLength(1)

  const primaryBgElements = container.querySelectorAll('.bg-primary')
  expect(primaryBgElements.length).toBeGreaterThanOrEqual(2)
})
