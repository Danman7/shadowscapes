import { render } from '@testing-library/react'

import { Card } from '@/components/Card'
import { cardDefinitions } from '@/data'
import { CardDefinition } from '@/types'

const props: CardDefinition = cardDefinitions.TempleGuard

it('shows name', () => {
  const { getByText } = render(<Card {...props} />)

  expect(getByText(props.constants.name)).toBeInTheDocument()
})

it.todo('shows strength')

it.todo('shows categories')

it.todo('shows effects description')

it.todo('shows flavor text')

it.todo('shows cost')
