import { render } from '@testing-library/react'

import { PlayerBadge } from 'src/components'
import type { Player } from 'src/game-engine'
import { PLACEHOLDER_PLAYER } from 'src/game-engine'
import { messages } from 'src/i18n'

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

  expect(getByText(messages.ui.ready)).toBeInTheDocument()
})

test('renders without active indicator when isActive is false', () => {
  const { getByTestId, queryByTestId } = render(<PlayerBadge player={player} />)

  const badge = getByTestId('player-badge')
  expect(badge).toBeInTheDocument()
  expect(badge).toHaveClass('top-2')
  expect(badge).not.toHaveClass('border-primary')
  expect(badge).not.toHaveClass('bottom-2')

  const pingIndicator = queryByTestId('active-indicator-ping')
  expect(pingIndicator).not.toBeInTheDocument()
})

test('renders with active indicator when isActive is true', () => {
  const { getByTestId } = render(<PlayerBadge player={player} isActive />)

  const badge = getByTestId('active-player-badge')
  expect(badge).toBeInTheDocument()
  expect(badge).toHaveClass('border-primary')
  expect(badge).toHaveClass('bottom-2')
  expect(badge).not.toHaveClass('top-2')

  expect(getByTestId('active-indicator')).toBeInTheDocument()
  expect(getByTestId('active-indicator-ping')).toBeInTheDocument()
  expect(getByTestId('active-indicator-dot')).toBeInTheDocument()
})
