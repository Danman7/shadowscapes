import { render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { CardBack } from '@/components/CardBack'

describe('CardBack', () => {
  test('renders card back with default styling', () => {
    const { container } = render(<CardBack />)
    expect(container.firstChild).toMatchSnapshot()
  })

  test('renders card back with custom className', () => {
    const { getByTestId } = render(<CardBack className="custom-class" />)
    const cardBack = getByTestId('card-back')
    expect(cardBack.classList.contains('custom-class')).toBe(true)
  })

  test('has testid for testing', () => {
    const { getByTestId } = render(<CardBack />)
    expect(getByTestId('card-back')).toBeTruthy()
  })
})
