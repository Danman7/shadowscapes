import { render } from '@testing-library/react'

import { Button } from 'src/components'

const label = 'Click Me'

test('renders disabled button with label', () => {
  const { getByText } = render(<Button>{label}</Button>)

  expect(getByText(label)).toBeInTheDocument()
})

test('calls onClick when clicked', () => {
  const handleClick = vi.fn()
  const { getByText } = render(<Button onClick={handleClick}>{label}</Button>)

  const buttonElement = getByText(label)
  buttonElement.click()

  expect(handleClick).toHaveBeenCalledTimes(1)
})
