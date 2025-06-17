import { UserProvider } from 'src/modules/user/components/UserProvider'
import { useUser } from 'src/modules/user/hooks'
import { mockLoadedUserState, mockOrderUser } from 'src/modules/user/mocks'
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
    const preloadedState: UserState = mockLoadedUserState

    const { getByText } = render(
      <UserProvider preloadedState={preloadedState}>
        <TestComponent />
      </UserProvider>,
    )

    expect(getByText(mockOrderUser.name)).toBeInTheDocument()
  })
})
