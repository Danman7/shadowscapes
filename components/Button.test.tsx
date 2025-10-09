import { render } from '@testing-library/react'

import { Button, ButtonProps } from '@/components/Button'



const children = 'Click me'
const props: ButtonProps = {
  children,
  onClick: jest.fn(),
}

it('shows children', () => {
  const { getByText } = render(<Button {...props} />)

  expect(getByText(children)).toBeInTheDocument()
})

it('calls onClick when clicked', () => {
  const { getByRole } = render(<Button {...props} />)

  getByRole('button').click()

  expect(props.onClick).toHaveBeenCalledTimes(1)
})
