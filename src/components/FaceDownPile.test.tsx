import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { expect, test } from 'bun:test'

import { FaceDownPile } from '@/components/FaceDownPile'

test('renders pile with label, cards and count', () => {
  const { getByTestId, getByText } = render(
    <FaceDownPile count={30} label="Deck" />,
  )
  expect(getByText('Deck')).toBeInTheDocument()
  expect(getByTestId('card-back')).toBeInTheDocument()

  expect(getByTestId('deck-count')).toHaveTextContent('30')
})

test('renders empty pile when count is 0', () => {
  const { queryByTestId, getByText } = render(
    <FaceDownPile count={0} label="Deck" />,
  )

  expect(getByText('Empty')).toBeInTheDocument()
  expect(queryByTestId('deck-count')).not.toBeInTheDocument()
})
