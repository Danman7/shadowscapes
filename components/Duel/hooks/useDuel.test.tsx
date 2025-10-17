import { renderHook } from '@testing-library/react'

import { DuelProvider } from '@/components/Duel/DuelProvider'
import { useDuel } from '@/components/Duel/hooks/useDuel'
import { messages } from '@/i18n'
import { initialDuelState } from '@/state'

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
    expect(current.state).toEqual(initialDuelState)
  })
})
