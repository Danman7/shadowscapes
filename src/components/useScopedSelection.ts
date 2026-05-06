import { useState } from 'react'

interface ScopedSelectionState {
  scopeKey: string | null
  selectedId: string | null
}

export interface ScopedSelectionController {
  selectedId: string | null
  select: (nextSelectedId: string) => void
  clear: () => void
}

export const useScopedSelection = (
  scopeKey: string | null,
): ScopedSelectionController => {
  const [state, setState] = useState<ScopedSelectionState>({
    scopeKey: null,
    selectedId: null,
  })

  const selectedId = state.scopeKey === scopeKey ? state.selectedId : null

  const select = (nextSelectedId: string): void => {
    if (scopeKey === null) return

    setState({
      scopeKey,
      selectedId: nextSelectedId,
    })
  }

  const clear = (): void => {
    setState({
      scopeKey: null,
      selectedId: null,
    })
  }

  return {
    selectedId,
    select,
    clear,
  }
}
