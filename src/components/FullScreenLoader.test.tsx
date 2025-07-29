import { FullScreenLoader } from 'src/components/FullScreenLoader'
import { render } from 'src/test-utils'

it('shows message', () => {
  const message = 'Loading...'
  const { getByText } = render(<FullScreenLoader message={message} />)

  expect(getByText(message)).toBeInTheDocument()
})
