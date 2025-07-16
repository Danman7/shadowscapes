import { renderHook } from '@testing-library/react'

import { messages } from 'src/i18n'
import { UserProvider } from 'src/modules/user/components/UserProvider'
import { useUser } from 'src/modules/user/hooks'
import { initialState } from 'src/modules/user/reducer'

describe('useUser', () => {
  it('should throw an error when useUser is used outside UserProvider', () => {
    expect(() => {
      renderHook(() => useUser())
    }).toThrow(messages.user.contextError)
  })

  it('should return the user context when used within UserProvider', () => {
    const {
      result: { current },
    } = renderHook(() => useUser(), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>,
    })

    expect(current).toHaveProperty('dispatch')
    expect(current.state).toEqual(initialState)
  })
})
