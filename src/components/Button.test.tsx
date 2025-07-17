import { GiFist } from 'react-icons/gi'

import { Button } from 'src/components/Button'
import { fighterIcon } from 'src/jest.setup'
import { render } from 'src/test-utils'

describe('Button', () => {
  it('shows message when one is supplied', () => {
    const message = 'Click me'
    const { getByText } = render(<Button message={message} />)

    expect(getByText(message)).toBeInTheDocument()
  })

  it('renders icon when one is provided', () => {
    const icon = <GiFist />
    const { getByTestId } = render(<Button icon={icon} />)

    expect(getByTestId(fighterIcon)).toBeInTheDocument()
  })

  it('renders both message and icon when both are provided', () => {
    const message = 'Click me'
    const icon = <GiFist />
    const { getByText, getByTestId } = render(
      <Button message={message} icon={icon} />,
    )

    expect(getByText(message)).toBeInTheDocument()
    expect(getByTestId(fighterIcon)).toBeInTheDocument()
  })
})
