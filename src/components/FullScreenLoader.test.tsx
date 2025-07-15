import { FullScreenLoader } from 'src/components/FullScreenLoader'
import { render } from 'src/test-utils'

describe('FullScreenLoader', () => {
  it('shows message', () => {
    const message = 'Loading...'
    const { getByText } = render(<FullScreenLoader message={message} />)

    expect(getByText(message)).toBeInTheDocument()
  })
})
