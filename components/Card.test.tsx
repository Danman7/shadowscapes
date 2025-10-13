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

it('shows single paragraph description', () => {
  const props: CardDefinition = cardDefinitions.YoraSkull
  const { getByText } = render(<Card {...props} />)

  expect(props.constants.description).not.toBeInstanceOf(Array)

  expect(getByText(props.constants.description as string)).toBeInTheDocument()
})

it('shows multiple paragraphs description', () => {
  const { getByText } = render(<Card {...props} />)

  expect(props.constants.description).toBeInstanceOf(Array)

  if (Array.isArray(props.constants.description)) {
    props.constants.description.forEach((paragraph) => {
      expect(getByText(paragraph)).toBeInTheDocument()
    })
  }
})

it('shows flavor text', () => {
  const { getByText } = render(<Card {...props} />)

  expect(getByText(props.constants.flavor)).toBeInTheDocument()
})

it.todo('shows cost')

it.todo('shows rank icon for elites')
