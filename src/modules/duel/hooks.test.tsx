import { renderHook } from '@testing-library/react'

import { messages } from 'src/i18n/indext'
import { DuelProvider } from 'src/modules/duel/components/DuelProvider'
import { useDuel } from 'src/modules/duel/hooks'
import { initialState } from 'src/modules/duel/reducer'

describe('useDuel', () => {
  it('should throw an error when useDuel is used outside DuelProvider', () => {
    expect(() => {
      renderHook(() => useDuel())
    }).toThrow(messages.duel.contextError)
  })

  it('should return the duel context when used within DuelProvider', () => {
    const {
      result: { current },
    } = renderHook(() => useDuel(), {
      wrapper: ({ children }) => <DuelProvider>{children}</DuelProvider>,
    })

    expect(current).toHaveProperty('dispatch')
    expect(current.state).toEqual(initialState)
  })
})
