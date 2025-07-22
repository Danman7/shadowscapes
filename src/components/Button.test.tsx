import { GiFist } from 'react-icons/gi'

import { Button } from 'src/components/Button'
import { fighterIcon } from 'src/jest.setup'
import { render } from 'src/test-utils'

const message = 'Click me'
const icon = <GiFist />
const onClick = jest.fn()

describe('Button', () => {
  it('shows message when one is supplied', () => {
    const { getByText } = render(<Button>{message}</Button>)

    expect(getByText(message)).toBeInTheDocument()
  })

  it('renders icon when one is provided', () => {
    const { getByTestId } = render(<Button>{icon}</Button>)

    expect(getByTestId(fighterIcon)).toBeInTheDocument()
  })

  it('renders both message and icon when both are provided', () => {
    const { getByText, getByTestId } = render(
      <Button>
        {icon} {message}
      </Button>,
    )

    expect(getByText(message)).toBeInTheDocument()
    expect(getByTestId(fighterIcon)).toBeInTheDocument()
  })

  it('calls onClick when button is clicked', () => {
    const { getByRole } = render(<Button onClick={onClick}>Click me</Button>)

    getByRole('button').click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when no onClick is provided', () => {
    const { getByRole } = render(<Button>Click me</Button>)

    const button = getByRole('button')
    expect(button).toBeDisabled()
  })
})
