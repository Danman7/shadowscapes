import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { DeckPile } from '@/components/DeckPile'

describe('DeckPile', () => {
  test('renders deck pile with cards', () => {
    const { container } = render(<DeckPile count={10} />)

    expect(screen.getByTestId('deck-count')).toBeTruthy()
    expect(screen.getByText('10')).toBeTruthy()
    expect(screen.getByTestId('card-back')).toBeTruthy()
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders custom label', () => {
    render(<DeckPile count={5} label="My Deck" />)

    expect(screen.getByText('My Deck')).toBeTruthy()
  })

  test('renders empty deck', () => {
    const { container } = render(<DeckPile count={0} />)

    expect(screen.getByTestId('deck-empty')).toBeTruthy()
    expect(screen.getByText('Empty')).toBeTruthy()
    expect(screen.queryByTestId('card-back')).toBeNull()
    expect(container.firstChild).toMatchSnapshot()
  })
})
