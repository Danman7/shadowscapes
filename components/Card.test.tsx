import { render } from '@testing-library/react'

import { Card } from '@/components/Card'
import { joinStringsWithComma } from '@/components/utils'
import { cardDefinitions } from '@/data'
import { instantIcon } from '@/jest.setup'
import { CardDefinition } from '@/types'

const props: CardDefinition = cardDefinitions.TempleGuard

it('shows name', () => {
  const { getByText } = render(<Card {...props} />)

  expect(getByText(props.constants.name)).toBeInTheDocument()
})

it('shows categories', () => {
  const { getByText } = render(<Card {...props} />)

  expect(getByText(joinStringsWithComma(props.categories))).toBeInTheDocument()
})

it('shows strength if character', () => {
  const { getByText } = render(<Card {...props} />)

  expect(getByText(props.strength)).toBeInTheDocument()
})

it('shows instant icon if instant', () => {
  const { getByTestId } = render(<Card {...cardDefinitions.YoraSkull} />)

  expect(getByTestId(instantIcon)).toBeInTheDocument()
})

it.todo('shows effects description')

it.todo('shows flavor text')

it.todo('shows cost')
