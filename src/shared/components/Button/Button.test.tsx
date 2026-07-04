import { fireEvent, render, screen } from '@testing-library/react'

import { Button } from './Button'

test('renders its label and invokes onClick', () => {
  const onClick = vi.fn()

  render(
    <Button
      label={<span data-testid="button-label">Pass</span>}
      onClick={onClick}
    />,
  )

  const button = screen.getByRole('button', { name: 'Pass' })

  expect(button).toHaveAttribute('type', 'button')
  expect(button).toHaveClass('paper', 'text-primary')
  expect(screen.getByTestId('button-label')).toBeInTheDocument()

  fireEvent.click(button)

  expect(onClick).toHaveBeenCalledOnce()
})
