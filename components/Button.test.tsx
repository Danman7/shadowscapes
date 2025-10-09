import { Button, ButtonProps } from '@/components/Button'
import { render } from '@testing-library/react'

const children = 'Click me'
const onClick = jest.fn()
const props: ButtonProps = {
  children,
  onClick,
}

it('shows children', () => {
  const { getByText } = render(<Button {...props} />)

  expect(getByText(children)).toBeInTheDocument()
})

it('calls onClick when clicked', () => {
  const { getByRole } = render(<Button {...props} />)

  getByRole('button').click()
  expect(onClick).toHaveBeenCalledTimes(1)
})
