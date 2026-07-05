import { renderHook } from '@testing-library/react'

import { useCombatInteraction } from './useCombatInteraction'

test('throws when used outside CombatInteractionProvider', () => {
  expect(() => renderHook(() => useCombatInteraction())).toThrow(
    'useCombatInteraction must be used inside CombatInteractionProvider',
  )
})
