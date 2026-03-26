import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/react'

import { Logs } from 'src/components'
import { formatString, messages } from 'src/i18n'

test('renders nothing when there are no logs', () => {
  const { queryByText } = render(<Logs logs={[]} onClose={() => {}} />)

  expect(queryByText(messages.ui.logs)).not.toBeInTheDocument()
})

test('renders logs title and all log entries', () => {
  const logs = [
    formatString(messages.reducer.goesFirst, { playerName: 'Garrett' }),
    formatString(messages.reducer.skipRedraw, { playerName: 'Constantine' }),
    formatString(messages.reducer.playCard, {
      playerName: 'Garrett',
      cardName: 'Temple Guard',
      cost: 4,
      remaining: 0,
    }),
  ]

  const { getByText } = render(<Logs logs={logs} onClose={() => {}} />)

  expect(getByText(messages.ui.logs)).toBeInTheDocument()

  logs.forEach((log) => {
    expect(getByText(log)).toBeInTheDocument()
  })
})

test('calls onClose when close icon is clicked', () => {
  const onClose = vi.fn()
  const { container } = render(
    <Logs
      logs={[
        formatString(messages.reducer.goesFirst, { playerName: 'Garrett' }),
      ]}
      onClose={onClose}
    />,
  )

  const closeIcon = container.querySelector('svg')
  if (closeIcon === null) throw new Error('Expected close icon to be rendered')

  fireEvent.click(closeIcon)

  expect(onClose).toHaveBeenCalledTimes(1)
})
