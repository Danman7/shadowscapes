import { fireEvent, render, screen } from '@testing-library/react'

import { messages } from '../../../l10n/en'
import { Modal } from './Modal'

test('renders a paper dialog and closes through the icon or Escape', () => {
  const onCancel = vi.fn()

  render(
    <Modal title="Choose a card" onCancel={onCancel}>
      <p>Modal body</p>
    </Modal>,
  )

  const dialog = screen.getByRole('dialog', { name: 'Choose a card' })

  expect(dialog).toHaveClass('paper')
  expect(screen.getByText('Modal body')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: messages.ui.closeLabel }))
  fireEvent.keyDown(window, { key: 'Enter' })
  expect(onCancel).toHaveBeenCalledOnce()

  fireEvent.keyDown(window, { key: 'Escape' })

  expect(onCancel).toHaveBeenCalledTimes(2)
})

test('omits the close icon when no cancel handler is provided', () => {
  render(
    <Modal title="Required choice">
      <p>Pick one</p>
    </Modal>,
  )

  expect(screen.getByRole('dialog', { name: 'Required choice' })).toHaveClass(
    'paper',
  )
  expect(
    screen.queryByRole('button', { name: messages.ui.closeLabel }),
  ).not.toBeInTheDocument()
})
