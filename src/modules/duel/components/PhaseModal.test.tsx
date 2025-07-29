import { PhaseModal } from 'src/modules/duel/components/PhaseModal'
import { render } from 'src/test-utils'

const content = 'This is the modal content'

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

it('should show content when it is visible', () => {
  const { getByText } = render(<PhaseModal>{content}</PhaseModal>)

  expect(getByText(content)).toBeInTheDocument()
})

it('should not show content after the timeout', async () => {
  const { queryByText, waitFor, act } = render(
    <PhaseModal>{content}</PhaseModal>,
  )

  expect(queryByText(content)).toBeInTheDocument()

  act(() => {
    jest.advanceTimersByTime(5000)
  })

  await waitFor(() => {
    expect(queryByText(content)).not.toBeInTheDocument()
  })
})
