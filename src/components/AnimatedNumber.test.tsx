import { act, render } from '@testing-library/react'

import { AnimatedNumber } from 'src/components'

describe('AnimatedNumber', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  test('renders the current value and no floating delta on initial render', () => {
    const { getByText, queryByText } = render(<AnimatedNumber value={5} />)

    expect(getByText('5')).toBeInTheDocument()
    expect(queryByText('+5')).not.toBeInTheDocument()
    expect(queryByText('-5')).not.toBeInTheDocument()
  })

  test('shows positive signed delta when value increases and removes it after 2 seconds', () => {
    const { getByText, queryByText, rerender } = render(
      <AnimatedNumber value={2} />,
    )

    rerender(<AnimatedNumber value={5} />)

    expect(getByText('5')).toBeInTheDocument()
    expect(getByText('+3')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(queryByText('+3')).not.toBeInTheDocument()
  })

  test('shows negative signed delta when value decreases', () => {
    const { getByText, rerender } = render(<AnimatedNumber value={7} />)

    rerender(<AnimatedNumber value={4} />)

    expect(getByText('4')).toBeInTheDocument()
    expect(getByText('-3')).toBeInTheDocument()
  })

  test('does not show floating delta when value does not change', () => {
    const { queryByText, rerender } = render(<AnimatedNumber value={9} />)

    rerender(<AnimatedNumber value={9} />)
    vi.runOnlyPendingTimers()

    expect(queryByText('+0')).not.toBeInTheDocument()
    expect(queryByText('-0')).not.toBeInTheDocument()
  })

  test('updates the displayed value when it changes', () => {
    const { getByText, rerender } = render(<AnimatedNumber value={3} />)

    rerender(<AnimatedNumber value={8} />)

    expect(getByText('8')).toBeInTheDocument()
  })

  test('stacks floating deltas when value changes again before timeout', () => {
    const { getAllByText, rerender } = render(<AnimatedNumber value={1} />)

    rerender(<AnimatedNumber value={4} />)
    expect(getAllByText('+3')).toHaveLength(1)

    rerender(<AnimatedNumber value={7} />)
    expect(getAllByText('+3')).toHaveLength(2)
  })

  test('removes each stacked floating delta after its own timeout', () => {
    const { queryAllByText, rerender } = render(<AnimatedNumber value={1} />)

    rerender(<AnimatedNumber value={4} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    rerender(<AnimatedNumber value={7} />)
    expect(queryAllByText('+3')).toHaveLength(2)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(queryAllByText('+3')).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(queryAllByText('+3')).toHaveLength(0)
  })
})
