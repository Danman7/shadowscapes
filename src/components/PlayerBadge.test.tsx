import { render } from '@testing-library/react'
import { expect, test } from 'vitest'

import { PlayerBadge } from '@/components/PlayerBadge'

test('renders children content', () => {
  const { getByText } = render(<PlayerBadge>Player Name</PlayerBadge>)

  expect(getByText('Player Name')).toBeInTheDocument()
})

test('renders without active indicator when isActive is false', () => {
  const { container } = render(
    <PlayerBadge isActive={false}>Player Name</PlayerBadge>,
  )

  const badge = container.querySelector('.name-tag')
  expect(badge).toBeInTheDocument()
  expect(badge).toHaveClass('top-2')
  expect(badge).not.toHaveClass('border-primary')
  expect(badge).not.toHaveClass('bottom-2')

  const pingIndicator = container.querySelector('.animate-ping')
  expect(pingIndicator).not.toBeInTheDocument()
})

test('renders with active indicator when isActive is true', () => {
  const { container } = render(
    <PlayerBadge isActive={true}>Player Name</PlayerBadge>,
  )

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
