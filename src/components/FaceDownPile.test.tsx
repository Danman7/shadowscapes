import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { FaceDownPile } from 'src/components'
import { createCardInstance } from 'src/game-engine'

test('renders pile with label, cards and count', () => {
  const { getByTestId, getByText } = render(
    <FaceDownPile count={30} label="Deck" />,
  )
  expect(getByText('Deck')).toBeInTheDocument()
  expect(getByTestId('card-back')).toBeInTheDocument()

  expect(getByTestId('deck-count')).toHaveTextContent('30')
})

test('renders empty pile when count is 0', () => {
  const { queryByTestId } = render(<FaceDownPile count={0} label="Deck" />)

  expect(queryByTestId('deck-count')).not.toBeInTheDocument()
})

test('renders a motion card back anchor for each card in the pile', () => {
  const cards = [
    createCardInstance('zombie', 'card-1'),
    createCardInstance('haunt', 'card-2'),
  ]

  const { getAllByTestId, getByTestId } = render(
    <FaceDownPile cards={cards} label="Deck" />,
  )

  expect(getByTestId('deck-count')).toHaveTextContent('2')
  expect(getAllByTestId('card-back')).toHaveLength(2)
})
