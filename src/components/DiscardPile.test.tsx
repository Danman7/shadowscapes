import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { DiscardPile } from '@/components/DiscardPile'

describe('DiscardPile', () => {
  test('renders discard pile with cards', () => {
    const { container } = render(<DiscardPile count={5} />)

    expect(screen.getByTestId('discard-count')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.getByTestId('card-back')).toBeTruthy()
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders custom label', () => {
    render(<DiscardPile count={3} label="Graveyard" />)

    expect(screen.getByText('Graveyard')).toBeTruthy()
  })

  test('renders empty discard pile', () => {
    const { container } = render(<DiscardPile count={0} />)

    expect(screen.getByTestId('discard-empty')).toBeTruthy()
    expect(screen.getByText('Empty')).toBeTruthy()
    expect(screen.queryByTestId('card-back')).toBeNull()
    expect(container.firstChild).toMatchSnapshot()
  })
})
