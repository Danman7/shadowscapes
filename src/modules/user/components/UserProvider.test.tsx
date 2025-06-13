import { UserProvider } from 'src/modules/user/components/UserProvider'
import { useUser } from 'src/modules/user/hooks'
import { mockOrderUser } from 'src/modules/user/mocks'
import { initialState } from 'src/modules/user/reducer'
import { UserState } from 'src/modules/user/types'
import { render } from 'src/test-utils'

const userNotLoadedMessage = 'User not loaded'

const TestComponent: React.FC = () => {
  const {
    state: {
      user: { name },
      isUserLoaded,
    },
  } = useUser()

  return isUserLoaded ? <div>{name}</div> : <div>{userNotLoadedMessage}</div>
}

describe('UserProvider', () => {
  it('should provide initial state', () => {
    const { getByText } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    )

    expect(getByText(userNotLoadedMessage)).toBeInTheDocument()
  })

  it('should initialize with preloaded state if provided', () => {
    const preloadedState: UserState = {
      ...initialState,
      user: mockOrderUser,
      isUserLoaded: true,
    }

    const { getByText } = render(
      <UserProvider preloadedState={preloadedState}>
        <TestComponent />
      </UserProvider>,
    )

    expect(getByText(mockOrderUser.name)).toBeInTheDocument()
  })
})
