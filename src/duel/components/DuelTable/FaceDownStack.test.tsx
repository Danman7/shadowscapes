import { render, screen } from '@testing-library/react'

import { FaceDownStack } from './FaceDownStack'

test('displays the label and amount', () => {
  render(<FaceDownStack label="Deck" amount={10} />)

  const stackLabel = screen.getByText('Deck 10')

  expect(stackLabel).toBeInTheDocument()
})
