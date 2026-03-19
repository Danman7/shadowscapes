import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/react'

import { Logs } from 'src/components'

test('renders nothing when there are no logs', () => {
  const { queryByText } = render(<Logs logs={[]} onClose={() => {}} />)

  expect(queryByText('Logs')).not.toBeInTheDocument()
})

test('renders logs title and all log entries', () => {
  const logs = [
    'Garrett goes first.',
    'Constantine skipped redraw.',
    'Garrett played Temple Guard for 4 coins.',
  ]

  const { getByText } = render(<Logs logs={logs} onClose={() => {}} />)

  expect(getByText('Logs')).toBeInTheDocument()

  logs.forEach((log) => {
    expect(getByText(log)).toBeInTheDocument()
  })
})

test('calls onClose when close icon is clicked', () => {
  const onClose = vi.fn()
  const { container } = render(
    <Logs logs={['Garrett goes first.']} onClose={onClose} />,
  )

  const closeIcon = container.querySelector('svg')
  if (closeIcon === null) throw new Error('Expected close icon to be rendered')

  fireEvent.click(closeIcon)

  expect(onClose).toHaveBeenCalledTimes(1)
})
